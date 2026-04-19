var cloud_name = "royal-palms" || process.env.cloud_name; 
var api_key = "211369983144952" || process.env.api_key;
var unsigned_preset = "nationwide" || process.env.unsigned_preset;

// patching `parseJSON` because Froala doesn't allow customization of response
var _parseJSON = jQuery.parseJSON;
jQuery.parseJSON = function(j) {
    var response = _parseJSON(j);
    // TODO proper selection of url / secure_url based on the document link
    response.link = response.url; // Froala expects `link`
    return response;
};

$('.editor').editable({
    inlineMode: false,
    zIndex: 2501,
    imageUploadURL: "https://api.cloudinary.com/v1_1/" + cloud_name + "/auto/upload",
    imageUploadParams: {
        upload_preset: unsigned_preset,
        api_key: api_key,
        folder: 'assets'
    }
});