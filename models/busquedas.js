const axios = require("axios");

const fs = require("fs");

class Busquedas {
  historial = [];
  dbPath = "./db/database.json";

  constructor() {
    //TODO: leer DB si existe
    this.leerDB();
  }

  //COLOCAR EN MAYUSCULA LAS PRIMERAS LETRAS
  get historialCapitalizado() {
    return this.historial.map((lugar) => {
      let palabras = lugar.split(" ");
      palabras = palabras.map((p) => p[0].toUpperCase() + p.substring(1));

      return palabras.join(" ");
    });
  }

  get paramsMapbox() {
    return {
      access_token: process.env.MAPBOX_KEY,
      limit: 5,
      language: "es",
    };
  }

  get paramsOpenWeather() {
    return {
      appid: process.env.OPENWEATHER_KEY,
      units: "metric",
      lang: "es",
    };
  }

  async ciudad(lugar = "") {
    try {
      // Petición HTTP de los lugares de Mapbox
      const instance = axios.create({
        baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
        params: this.paramsMapbox,
      });

      const resp = await instance.get();
      return resp.data.features.map((lugar) => ({
        id: lugar.id,
        nombre: lugar.place_name,
        lng: lugar.center[0],
        lat: lugar.center[1],
      }));
    } catch (error) {
      return [];
    }
  }

  //Peticion HTTP del clima de OpenWeather
  async climaLugar(lat, lon) {
    try {
      //instance axios.create()
      const instance = axios.create({
        baseURL: `https://api.openweathermap.org/data/2.5/weather`,
        params: { ...this.paramsOpenWeather, lat, lon },
      });

      //resp.data
      const resp = await instance.get();
      const { weather, main } = resp.data;

      return {
        desc: weather[0].description,
        min: main.temp_min,
        max: main.temp_max,
        temp: main.temp,
      };
    } catch (error) {
      console.log(error);
    }
  }

  //Agregar al historial  de busquedas de los lugares
  agregarHistorial(lugar = "") {
    //TODO: prevenir duplicados
    if (this.historial.includes(lugar.toLocaleLowerCase())) {
      return;
    }

    this.historial = this.historial.splice(0, 5);

    this.historial.unshift(lugar.toLocaleLowerCase());

    //Grabar en DB
    this.guardarDB();
  }

  //Guardar en DB el historial de busquedas de los lugares
  guardarDB() {
    const payload = {
      historial: this.historial,
    };

    fs.writeFileSync(this.dbPath, JSON.stringify(payload));
  }

  leerDB() {
    //debe existir
    if (!fs.existsSync(this.dbPath)) return;

    const info = fs.readFileSync(this.dbPath, { encoding: "utf-8" });
    const data = JSON.parse(info);

    this.historial = data.historial;
  }
}

module.exports = Busquedas;
