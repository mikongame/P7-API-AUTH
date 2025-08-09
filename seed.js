import mongoose from "mongoose";
import dotenv from "dotenv";
import readline from "readline";
import Place from "./models/Place.js";
import Experience from "./models/Experience.js";
import User from "./models/User.js";

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌ Falta MONGO_URI en .env");
  process.exit(1);
}

const ALLOWED_TYPES = ["riddle", "qr", "gps", "photo"];

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Conectado a MongoDB para semilla");

    // Limpieza
    await Experience.deleteMany();
    await Place.deleteMany();
    await User.deleteMany();

    // Admin por defecto (contraseña en claro → la hashea el modelo en pre('save'))
    const admin = await User.create({
      username: "admin",
      email: "admin@escapurbis.com",
      password: "admin123",
      role: "admin"
    });
    console.log("👤 Usuario admin creado: admin@escapurbis.com / admin123");

    const useDefault = (await ask("¿Usar datos predefinidos? (s/n): "))
      .trim()
      .toLowerCase() === "s";

    if (useDefault) {
      const place1 = await Place.create({
        title: "Búnker del Carmel",
        description: "Punto panorámico con historia militar",
        location: "Carmel, Barcelona",
        createdBy: admin._id
      });

      const place2 = await Place.create({
        title: "El Refugi 307",
        description: "Refugio antiaéreo de la Guerra Civil",
        location: "Poble Sec, Barcelona",
        createdBy: admin._id
      });

      const exp1 = await Experience.create({
        text: "¿Qué año aparece grabado en la entrada?",
        type: "riddle",
        solution: "1937",
        place: place1._id,
        createdBy: admin._id
      });

      const exp2 = await Experience.create({
        text: "Escanea el QR escondido junto al cañón oxidado.",
        type: "qr",
        solution: "escape-barcelona",
        place: place1._id,
        createdBy: admin._id
      });

      const exp3 = await Experience.create({
        text: "Introduce la contraseña secreta del guía.",
        type: "riddle",
        solution: "Refugi307",
        place: place2._id,
        createdBy: admin._id
      });

      await Place.findByIdAndUpdate(place1._id, {
        $addToSet: { experiences: { $each: [exp1._id, exp2._id] } }
      });

      await Place.findByIdAndUpdate(place2._id, {
        $addToSet: { experiences: exp3._id }
      });

      // Referencias en User
      await User.findByIdAndUpdate(admin._id, {
        $addToSet: {
          places: { $each: [place1._id, place2._id] },
          experiences: { $each: [exp1._id, exp2._id, exp3._id] }
        }
      });

      console.log("🌱 Lugares y experiencias creados por defecto");
    } else {
      const numPlacesRaw = await ask("¿Cuántos lugares quieres crear?: ");
      const numPlaces = Number.parseInt(numPlacesRaw, 10) || 0;

      for (let i = 0; i < numPlaces; i++) {
        const title = (await ask(`Título del lugar ${i + 1}: `)).trim();
        const description = (await ask(`Descripción: `)).trim();
        const location = (await ask(`Ubicación: `)).trim();

        const place = await Place.create({
          title,
          description,
          location,
          createdBy: admin._id
        });

        const expIds = [];
        const numExpRaw = await ask(`¿Cuántas experiencias para "${title}"?: `);
        const numExperiences = Number.parseInt(numExpRaw, 10) || 0;

        for (let j = 0; j < numExperiences; j++) {
          const text = (await ask(` - Enunciado de la experiencia ${j + 1}: `)).trim();
          let type = (await ask(` - Tipo (riddle/qr/gps/photo): `)).trim().toLowerCase();

          while (!ALLOWED_TYPES.includes(type)) {
            console.log("⚠️ Tipo inválido. Usa: riddle | qr | gps | photo");
            type = (await ask(` - Tipo (riddle/qr/gps/photo): `)).trim().toLowerCase();
          }

          const solution = (await ask(` - Solución: `)).trim();

          const experience = await Experience.create({
            text,
            type,
            solution,
            place: place._id,
            createdBy: admin._id
          });
          expIds.push(experience._id);
        }

        await Place.findByIdAndUpdate(place._id, {
          $addToSet: { experiences: { $each: expIds } }
        });

        await User.findByIdAndUpdate(admin._id, {
          $addToSet: { places: place._id, experiences: { $each: expIds } }
        });

        console.log(`✅ Lugar "${title}" creado con ${expIds.length} experiencias.`);
      }
    }

    console.log("✅ Semilla finalizada");
    rl.close();
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al ejecutar semilla:", error);
    rl.close();
    await mongoose.connection.close();
    process.exit(1);
  }
};

seed();
