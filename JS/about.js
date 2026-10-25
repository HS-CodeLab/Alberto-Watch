
// THEME TOGGLE

const themeToggle = document.getElementById("themeToggle");

themeToggle.addEventListener("click", function(){

 const current = document.documentElement.dataset.theme;

 const next = current === "dark" ? "light" : "dark";

 document.documentElement.dataset.theme = next;

 try {
  localStorage.setItem("albertoTheme",next);
 } catch(e) {}

});


// FIXED HEADER HEIGHT

const headerShell = document.getElementById("fixedHeaderShell");

function updateHeaderHeight(){

 document.documentElement.style.setProperty(
  "--fixed-header-height",
  headerShell.getBoundingClientRect().height + "px"
 );

}

updateHeaderHeight();

window.addEventListener("resize",updateHeaderHeight);
window.addEventListener("load",updateHeaderHeight);

if("ResizeObserver" in window){
 new ResizeObserver(updateHeaderHeight).observe(headerShell);
}


// CART COUNT

function updateCartCount(){

 try {

  const cart = JSON.parse(
   localStorage.getItem("albertoCart") || "[]"
  );

  const count = Array.isArray(cart)
   ? cart.reduce((total,item)=>{
      return total + (Number(item.quantity) || 1);
     },0)
   : 0;

  document.getElementById("cartCount").textContent = count;

 } catch(e) {

  document.getElementById("cartCount").textContent = 0;

 }

}

updateCartCount();

window.addEventListener("storage",updateCartCount);


// SEARCH

document.getElementById("searchBtn").addEventListener("click",function(){
 window.location.href = "shop.html";
});


// NEWSLETTER DEMO

document.getElementById("newsletterForm").addEventListener("submit",function(e){

 e.preventDefault();

 alert("Thank you for your interest in Alberto Clock!");

 this.reset();

});


// FOOTER YEAR

document.getElementById("footerYear").textContent =
new Date().getFullYear();
