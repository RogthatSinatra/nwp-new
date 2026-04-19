const e=` uniform vec2 uResolution;
 uniform vec2 uImageResolution;      // Current image resolution
 uniform vec2 uNextImageResolution;  // Next image resolution
 uniform float uTransition;  // Single transition value (0-1)
 uniform float uTime;
 uniform sampler2D uTexture;     // Current image
 uniform sampler2D uNextTexture; // Next image
 uniform float uIntensity;        // Controls tile repetition

 varying vec2 vUv;

 // Rotation matrix helper function
 mat2 rotate(float a) {
     float s = sin(a);
     float c = cos(a);
     return mat2(c, -s, s, c);
 }

 // Calculate aspect-ratio-corrected UVs for a given image resolution
 vec2 getAspectCorrectedUV(vec2 baseUv, vec2 canvasRes, vec2 imageRes) {
     vec2 ratio = vec2(
         min((canvasRes.x / canvasRes.y) / (imageRes.x / imageRes.y), 1.0),
         min((canvasRes.y / canvasRes.x) / (imageRes.y / imageRes.x), 1.0)
     );
     return vec2(
         baseUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
         baseUv.y * ratio.y + (1.0 - ratio.y) * 0.5
     );
 }

void main(void) {
    // Calculate aspect-ratio-corrected UVs for each image separately
    vec2 uv1 = getAspectCorrectedUV(vUv, uResolution, uImageResolution);
    vec2 uv2 = getAspectCorrectedUV(vUv, uResolution, uNextImageResolution);

    // TILED UV PATTERN
    // Use raw vUv for consistent sector count regardless of image dimensions
    vec2 uvDivided = fract(vUv * vec2(uIntensity, 1.0));

    // ROTATION AND DISPLACEMENT
    float angle = 0.7853981634; // PI/4 (45 degrees)
    float displacementScale = 0.1;

    // Outgoing image GAINS distortion as progress increases
    vec2 uvDisplaced1 = uv1 + rotate(angle) * uvDivided * uTransition * displacementScale;
    
    // Incoming image LOSES distortion as progress increases
    vec2 uvDisplaced2 = uv2 + rotate(angle) * uvDivided * (1.0 - uTransition) * displacementScale;

    // Sample both textures with their respective displaced UVs
    vec4 t1 = texture2D(uTexture, uvDisplaced1);
    vec4 t2 = texture2D(uNextTexture, uvDisplaced2);

    // Mix between current and next image
    gl_FragColor = mix(t1, t2, uTransition);
}
`;export{e as default};