require("dotenv").config();

const mongoose = require("mongoose");
const connectDatabase = require("../config/database");
const Skill = require("../models/skillModel");

const skills = [
  { name: "Maçon", slug: "macon" },
  { name: "Soudeur", slug: "soudeur" },
  { name: "Électricien", slug: "electricien" },
  { name: "Plombier", slug: "plombier" },
  { name: "Carreleur", slug: "carreleur" },
  { name: "Menuisier", slug: "menuisier" },
  { name: "Mécanicien", slug: "mecanicien" },
  { name: "Couturier / Couturière", slug: "couturier-couturiere" },
  { name: "Peintre", slug: "peintre" },
  { name: "Plâtrier", slug: "platrier" },
];

const seedSkills = async () => {
  try {
    await connectDatabase();

    await Skill.deleteMany();

    await Skill.insertMany(skills);

    console.log("Skills seeded successfully");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Skill seed failed: ${error.message}`);
    process.exit(1);
  }
};

seedSkills();