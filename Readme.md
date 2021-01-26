DevTools esbeltas
Complemento de Mozilla Tienda virtual de Chrome

Instalar desde la página de complementos de Firefox o la página de complementos de Chrome

Svelte devtools se mantiene activamente. Si tiene algún problema o solicitud de funciones, no dude en crear un problema.

Svelte Devtools es una extensión de Firefox y Chrome para el marco javascript de Svelte. Le permite inspeccionar el estado de Svelte y las jerarquías de componentes en las herramientas de desarrollo.

Después de la instalación, verá una nueva pestaña en Herramientas para desarrolladores. Esta pestaña muestra un árbol de componentes Svelte, bloques HTMLx y elementos DOM que se representaron en la página. Al seleccionar uno de los nodos del árbol, puede inspeccionar y editar su estado actual en el panel de la derecha.

Requiere la versión esbelta 3.12.0 o superior

1.1.0 Captura de pantalla

Habilitando el modo de desarrollo
Para que svelte-devtools se comunique con su paquete de aplicaciones, el compilador svelte debe tener la devopción configurada en true.

Modelo
De forma predeterminada, la plantilla esbelta se establecerá dev: truecuando se ejecute npm run devy en falsecaso contrario.

Enrollar
A continuación se muestra una configuración acumulada minimalista con dev: trueset.

// rollup.config.js
import * as fs from 'fs';
import svelte from 'rollup-plugin-svelte';

export default {
  input: 'src/main.js',
  output: {
    file: 'public/bundle.js',
    format: 'iife'
  },
  plugins: [
    svelte({
      compilerOptions: {
        dev: true
      }
    })
  ]
}
Webpack
A continuación se muestra el fragmento relevante de un conjunto webpack.config.jscon dev: true.

  ...
  module: {
    rules: [
      ...
      {
        test: /\.(html|svelte)$/,
        exclude: /node_modules/,
        use: {
          loader: 'svelte-loader',
          options: {
            dev: true,
          },
        },
      },
      ...
    ]
  },
  ...
Construir desde la fuente
Firefox
Clone este repositorio y ejecute el script del paquete.

git clone https://github.com/RedHatter/svelte-devtools.git
cd svelte-devtools
npm install
npm run package:firefox
Esto debería construir la base de código y generar un archivo zip bajo web-ext-artifacts.

Los complementos sin firmar no se pueden instalar en Firefox de forma permanente, pero los complementos se pueden instalar temporalmente.

Navega a about:debugging.
Haga clic en "Cargar complemento temporal" y elija el archivo zip generado.
Cromo
Clone este repositorio y ejecute el script del paquete.

git clone https://github.com/RedHatter/svelte-devtools.git
cd svelte-devtools
npm install
npm run package:chrome
Esto debería construir la base de código y generar un archivo zip bajo web-ext-artifacts.

Navega a chrome://extensions/.
Active el modo de desarrollador usando el interruptor 'Modo de desarrollador' en la esquina superior derecha de la página.
Haga clic en 'Cargar desempaquetado' y seleccione el destdirectorio.
Lanzamientos 10
Versión 1.3.0
