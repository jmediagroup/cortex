<?php
/**
 * Plugin Name: Cortex Vercel Auto-Deploy
 * Description: Automatically triggers Vercel deployment when posts are published or updated
 * Version: 1.0.0
 * Author: Cortex Technologies
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class Cortex_Vercel_Deploy {

    /**
     * Vercel Deploy Hook URL - Set this in wp-config.php
     * define('CORTEX_VERCEL_DEPLOY_HOOK', 'https://api.vercel.com/v1/integrations/deploy/...');
     */
    private $deploy_hook_url;

    /**
     * Debounce time in seconds to prevent multiple deploys
     */
    private $debounce_seconds = 30;

    /**
     * Transient key for debouncing
     */
    private $debounce_key = 'cortex_vercel_deploy_debounce';

    public function __construct() {
        $this->deploy_hook_url = defined('CORTEX_VERCEL_DEPLOY_HOOK')
            ? CORTEX_VERCEL_DEPLOY_HOOK
            : '';

        // Only initialize if deploy hook is configured
        if (empty($this->deploy_hook_url)) {
            add_action('admin_notices', [$this, 'show_config_notice']);
            return;
        }

        // Hook into post status transitions
        add_action('transition_post_status', [$this, 'on_post_status_change'], 10, 3);

        // Hook into post updates (for published posts being edited)
        add_action('post_updated', [$this, 'on_post_updated'], 10, 3);

        // Add admin menu for manual deploys
        add_action('admin_menu', [$this, 'add_admin_menu']);

        // Handle manual deploy AJAX
        add_action('wp_ajax_cortex_manual_deploy', [$this, 'handle_manual_deploy']);
    }

    /**
     * Show admin notice if deploy hook is not configured
     */
    public function show_config_notice() {
        if (!current_user_can('manage_options')) {
            return;
        }

        echo '<div class="notice notice-warning is-dismissible">';
        echo '<p><strong>Cortex Vercel Deploy:</strong> Deploy hook URL not configured. ';
        echo 'Add <code>define(\'CORTEX_VERCEL_DEPLOY_HOOK\', \'your-url\');</code> to wp-config.php</p>';
        echo '</div>';
    }

    /**
     * Trigger deploy when post status changes to publish
     */
    public function on_post_status_change($new_status, $old_status, $post) {
        // Only trigger for posts (can extend to other post types)
        $allowed_post_types = apply_filters('cortex_vercel_deploy_post_types', ['post']);

        if (!in_array($post->post_type, $allowed_post_types)) {
            return;
        }

        // Trigger deploy when:
        // 1. Post is newly published
        // 2. Post is unpublished (removed from site)
        if ($new_status === 'publish' && $old_status !== 'publish') {
            $this->trigger_deploy('post_published', $post->ID);
        } elseif ($old_status === 'publish' && $new_status !== 'publish') {
            $this->trigger_deploy('post_unpublished', $post->ID);
        }
    }

    /**
     * Trigger deploy when a published post is updated
     */
    public function on_post_updated($post_id, $post_after, $post_before) {
        // Only trigger for published posts
        if ($post_after->post_status !== 'publish') {
            return;
        }

        // Only trigger for allowed post types
        $allowed_post_types = apply_filters('cortex_vercel_deploy_post_types', ['post']);

        if (!in_array($post_after->post_type, $allowed_post_types)) {
            return;
        }

        // Check if content actually changed
        if ($post_after->post_content === $post_before->post_content &&
            $post_after->post_title === $post_before->post_title &&
            $post_after->post_excerpt === $post_before->post_excerpt) {
            return;
        }

        $this->trigger_deploy('post_updated', $post_id);
    }

    /**
     * Trigger the Vercel deploy
     */
    private function trigger_deploy($reason, $post_id = null) {
        // Check debounce
        if (get_transient($this->debounce_key)) {
            $this->log("Deploy skipped (debounced) - Reason: {$reason}");
            return false;
        }

        // Set debounce transient
        set_transient($this->debounce_key, true, $this->debounce_seconds);

        // Prepare request body
        $body = [
            'trigger' => 'wordpress',
            'reason' => $reason,
            'post_id' => $post_id,
            'timestamp' => current_time('c'),
            'site_url' => get_site_url(),
        ];

        // Make the request
        $response = wp_remote_post($this->deploy_hook_url, [
            'body' => json_encode($body),
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'timeout' => 10,
            'blocking' => false, // Don't wait for response
        ]);

        if (is_wp_error($response)) {
            $this->log("Deploy failed - Error: " . $response->get_error_message());
            return false;
        }

        $this->log("Deploy triggered - Reason: {$reason}, Post ID: {$post_id}");

        // Store last deploy info
        update_option('cortex_last_vercel_deploy', [
            'time' => current_time('timestamp'),
            'reason' => $reason,
            'post_id' => $post_id,
        ]);

        return true;
    }

    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_submenu_page(
            'tools.php',
            'Vercel Deploy',
            'Vercel Deploy',
            'manage_options',
            'cortex-vercel-deploy',
            [$this, 'render_admin_page']
        );
    }

    /**
     * Render admin page
     */
    public function render_admin_page() {
        $last_deploy = get_option('cortex_last_vercel_deploy', null);
        ?>
        <div class="wrap">
            <h1>Cortex Vercel Deploy</h1>

            <div class="card" style="max-width: 600px; padding: 20px;">
                <h2>Deployment Status</h2>

                <?php if ($last_deploy): ?>
                    <p>
                        <strong>Last Deploy:</strong>
                        <?php echo date('F j, Y g:i a', $last_deploy['time']); ?>
                    </p>
                    <p>
                        <strong>Reason:</strong>
                        <?php echo esc_html($last_deploy['reason']); ?>
                    </p>
                    <?php if ($last_deploy['post_id']): ?>
                        <p>
                            <strong>Post:</strong>
                            <a href="<?php echo get_edit_post_link($last_deploy['post_id']); ?>">
                                <?php echo get_the_title($last_deploy['post_id']); ?>
                            </a>
                        </p>
                    <?php endif; ?>
                <?php else: ?>
                    <p>No deployments triggered yet.</p>
                <?php endif; ?>

                <hr style="margin: 20px 0;">

                <h3>Manual Deploy</h3>
                <p>Trigger a manual deployment to Vercel. Use this if you've made changes that weren't automatically detected.</p>

                <button id="cortex-manual-deploy" class="button button-primary">
                    Trigger Deploy Now
                </button>
                <span id="cortex-deploy-status" style="margin-left: 10px;"></span>
            </div>

            <div class="card" style="max-width: 600px; padding: 20px; margin-top: 20px;">
                <h2>Configuration</h2>
                <p>
                    <strong>Deploy Hook:</strong>
                    <?php echo $this->deploy_hook_url ? '✓ Configured' : '✗ Not configured'; ?>
                </p>
                <p>
                    <strong>Debounce:</strong>
                    <?php echo $this->debounce_seconds; ?> seconds
                </p>
                <p>
                    <strong>Post Types:</strong>
                    <?php echo implode(', ', apply_filters('cortex_vercel_deploy_post_types', ['post'])); ?>
                </p>
            </div>
        </div>

        <script>
        jQuery(document).ready(function($) {
            $('#cortex-manual-deploy').on('click', function() {
                var $button = $(this);
                var $status = $('#cortex-deploy-status');

                $button.prop('disabled', true);
                $status.text('Triggering deploy...');

                $.post(ajaxurl, {
                    action: 'cortex_manual_deploy',
                    nonce: '<?php echo wp_create_nonce('cortex_manual_deploy'); ?>'
                }, function(response) {
                    if (response.success) {
                        $status.text('✓ Deploy triggered!').css('color', 'green');
                    } else {
                        $status.text('✗ ' + response.data).css('color', 'red');
                    }

                    setTimeout(function() {
                        $button.prop('disabled', false);
                        $status.text('');
                    }, 3000);
                });
            });
        });
        </script>
        <?php
    }

    /**
     * Handle manual deploy AJAX request
     */
    public function handle_manual_deploy() {
        check_ajax_referer('cortex_manual_deploy', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error('Permission denied');
        }

        // Clear debounce for manual deploy
        delete_transient($this->debounce_key);

        $result = $this->trigger_deploy('manual');

        if ($result) {
            wp_send_json_success('Deploy triggered');
        } else {
            wp_send_json_error('Failed to trigger deploy');
        }
    }

    /**
     * Log deploy events (for debugging)
     */
    private function log($message) {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('[Cortex Vercel Deploy] ' . $message);
        }
    }
}

// Initialize the plugin
new Cortex_Vercel_Deploy();
