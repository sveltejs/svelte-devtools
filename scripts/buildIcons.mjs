import svgexport from 'svgexport'

svgexport.render([{
 'input' : ['src/svelte-logo.svg'],
 'output': [16, 24, 48, 96, 128].map(
   size => [`dest/icon-${size}.png`, `${size}:`]
 )
}]);
