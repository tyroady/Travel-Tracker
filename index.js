import express from "express";
import bodyParser from "body-parser";
import pg from "pg";


const app = express();
const port = 3000;

const db = new pg.Client({
  password:"Maximumgg16",
  user:"postgres",
  host: "localhost",
  port: 5432,
  database:"world"
});
db.connect();



app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function checkVisited(){
  let countries = [];
  const result = await db.query("SELECT country_code FROM visited_countries");
  //Burada result bir promise
  result.rows.forEach(row => {
    countries.push(row.country_code);
  });
  return countries
}


app.get("/", async (req, res) => {
  const countries = await checkVisited();
  res.render("index.ejs", {total: countries.length, countries: countries });
  //db.end();
});

app.post("/add", async (req,res) => {
  let country = req.body["country"];
  //country = country.toLowerCase().trim();
  try {
  console.log(country);
  const result =await db.query("SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';"
  ,[country.toLowerCase()]);
    
    console.log("post sql sonuçlar:" + result.rows);
    if (result.rows.length !== 0){
    const code_data = result.rows[0].country_code; 
    console.log(code_data);
    await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)",[code_data]);
    res.redirect("/");
  } else {
    const countries = await checkVisited();
    res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    error: "Country name does not exxist, try again."
    })}
  
    } catch (err) {
    console.log(err);
    const countries = await checkVisited();
    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      error: "Already added",
    });
  }

  
 
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
