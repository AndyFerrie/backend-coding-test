import app from "./app"

const port = 3000

app.listen(port, () => {
    console.log(`Companies API running on http://localhost:${port}`)
})
