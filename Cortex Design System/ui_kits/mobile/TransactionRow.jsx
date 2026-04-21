function TransactionRow({ title, meta, amount, icon = 'cart', positive }) {
  const color = positive ? '#00F0A0' : '#FF3B30';
  return (
    <div style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px'}}>
      <div style={{width:38,height:38,borderRadius:9999,background:`${color}1E`,color,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,border:`1px solid ${color}33`}}><Ico name={icon} size={16}/></div>
      <div style={{flex:1,minWidth:0}}>
        <p style={{fontSize:14,fontWeight:500,color:'#F5F5F7',margin:0,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{title}</p>
        <p style={{fontSize:11,color:'#6D6D72',margin:'2px 0 0',fontFamily:'JetBrains Mono'}}>{meta}</p>
      </div>
      <span style={{fontSize:14,fontWeight:600,color,fontFamily:'JetBrains Mono',fontVariantNumeric:'tabular-nums'}}>{positive?'+':'−'}${amount}</span>
    </div>
  );
}
window.TransactionRow = TransactionRow;
