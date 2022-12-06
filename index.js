require("dotenv").config();

const {
  inquirerMenu,
  pausa,
  leerInput,
  listarLugares,
  agregarHistorial,
  historialCapitalizado
} = require("./helpers/inquirer");
const Busquedas = require("./models/busquedas");

/* console.log(process.env.MAPBOX_KEY); */

const main = async () => {
  const busquedas = new Busquedas();
  let opt = "";
  do {
    // Imprimir el menú
    opt = await inquirerMenu();

    switch (opt) {
      case 1:
        //Mostrar mensaje
        const termino = await leerInput("Ciudad: ");

        //Buscar los lugares
        const lugares = await busquedas.ciudad(termino);

        //seleccionar lugar
        const id = await listarLugares(lugares);
        if (id === "0") continue;

        const lugarSeleccionado = lugares.find((l) => l.id === id);
        /*  console.log(lugarSeleccionado); */

        //Guardar en DB
        busquedas.agregarHistorial(lugarSeleccionado.nombre);

        //clima
        const clima = await busquedas.climaLugar(
          lugarSeleccionado.lat,
          lugarSeleccionado.lng
        );

        //mostrar resultados
        console.clear();
        console.log("\nInformación de la ciudad\n".green);
        console.log("Ciudad: ", lugarSeleccionado.nombre);
        console.log("Lat:", lugarSeleccionado.lat);
        console.log("Lng:", lugarSeleccionado.lng);
        console.log("Temperatura:", clima.temp);
        console.log("Mínima:", clima.min);
        console.log("Máxima:", clima.max);
        console.log("Como está el clima:", clima.desc.green);

        break;

        //Historial de busquedas de los lugares en la DB
      case 2:
        busquedas.historialCapitalizado.forEach((lugar, i) => {
          const idx = `${i + 1}.`.green;
          console.log(`${idx} ${lugar}`);
        }
        );
        break;

    }

    if (opt !== 0) await pausa();
  } while (opt !== 0);
};

main();
