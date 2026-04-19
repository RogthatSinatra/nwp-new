//Query google for deals only
document.getElementById("searchG").addEventListener("click", function(event){
  event.preventDefault()
 function Gsearch(){
let queryS = document.getElementById('popup-search').value;
if(queryS === '' || queryS === null || queryS.length < 2 ){
alert('Invalid search')
}else{
window.location.href =`/search#gsc.tab=0&gsc.q=${queryS}`;
}
}
Gsearch();
});