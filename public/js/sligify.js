  function slugify(str){
    var $slug = '';
    var trimmed = $.trim(str);
    $slug = trimmed.replace(/[^a-z0-9-æøå]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .replace(/æ/gi, 'ae')
    .replace(/ø/gi, 'oe')
    .replace(/å/gi, 'a');
    return $slug.toLowerCase();
};

function addslug(){
if($('#permalink').val() === '' || $('#title').val() !== ''){
                $('#permalink').val(slugify($('#title').val()));
            }
};

// function addslug(){
// if($('#permalink').val() === '' && $('#title').val() !== ''){
//                 $('#permalink').val(slugify($('#title').val()));
//             }
// };