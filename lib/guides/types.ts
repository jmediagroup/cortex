export interface GuideFrontmatter {
  title: string;
  date: string;
  summary: string;
  topic: string;
  category?: string;
  tags?: string[];
  relatedTools?: string[];
  ogImage?: string;
  metaDescription?: string;
}

export interface GuideListItem {
  slug: string;
  title: string;
  date: string;
  summary: string;
  topic: string;
  category?: string;
  tags: string[];
  relatedTools: string[];
  readingTime: number;
  ogImage?: string;
}

export interface Guide extends GuideListItem {
  contentHtml: string;
  metaDescription?: string;
}
