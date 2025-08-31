
// Small scripts: shrink topbar on scroll and toggle theme preview
(function(){
  const topbar = document.getElementById('topbar');
  const tabbar = document.getElementById('tabbar');
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 20) {
      topbar.style.transform = 'translateY(-6px) scale(0.995)';
      topbar.style.boxShadow = '0 6px 18px rgba(2,6,23,0.45)';
      tabbar.style.transform = 'translateY(6px) scale(0.995)';
    } else {
      topbar.style.transform = '';
      topbar.style.boxShadow = '';
      tabbar.style.transform = '';
    }
  });

  // theme toggle (just demo)
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle){
    themeToggle.addEventListener('change', (e)=>{
      if (e.target.checked){
        document.documentElement.style.setProperty('--bg', '#050507');
        document.body.style.filter = 'brightness(0.95)';
      } else {
        document.body.style.filter = '';
      }
    });
  }
})();
