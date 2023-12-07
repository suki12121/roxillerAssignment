const express = require('express')
const axios = require('axios')
const sqlite3 = require('sqlite3').verbose()

const app = express()

const db = new sqlite3.Database('transactions.db')
app.get('/initialize_database', async (req, res) => {
  try {
    const response = await axios.get(
      'https://s3.amazonaws.com/roxiler.com/product_transaction.json',
    )
    const data = response.data

    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                description TEXT,
                category TEXT,
                price INTEGER,
                dateOfSale TEXT,
                sold INTEGER
            )`)

      const stmt = db.prepare(
        'INSERT INTO transactions (title, description, category, price, dateOfSale, sold) VALUES (?, ?, ?, ?, ?, ?)',
      )
      data.forEach(item => {
        stmt.run(
          item.title,
          item.description,
          item.category,
          item.price,
          item.dateOfSale,
          item.sold, // Assuming item.sold represents a boolean or an integer value
        )
      })
      stmt.finalize()
    })

    res.json({message: 'Database initialized with seed data'})
  } catch (error) {
    res.status(500).json({error: error.message})
  }
})

app.get('/list_transactions/:page/', (req, res) => {
  const {page} = req.params
  const {search, month} = req.query
  const {per_page = 10} = req.query
  const offset = (page - 1) * per_page

  let query = `SELECT * FROM transactions WHERE strftime('%m',dateOfSale)= '${month}' title LIKE '%${search}%' LIMIT ${per_page} OFFSET ${offset} `

  if (!search) {
    query = `SELECT * FROM transactions WHERE strftime('%m',dateOfSale)= '${month}' LIMIT ${per_page} OFFSET ${offset}`
  }

  db.all(query, (err, rows) => {
    if (err) {
      res.status(500).json({error: err.message})
      return
    }

    db.get('SELECT COUNT(*) AS total_count FROM transactions', (err, row) => {
      if (err) {
        res.status(500).json({error: err.message})
        return
      }

      const total_count = row.total_count

      res.json({
        total_count,
        transactions: rows,
      })
    })
  })
})

// Endpoint for statistics of selected month
app.get(`/statistics/:month`, (req, res) => {
  const {month} = req.params

  // Query to get total sale amount of selected month
  const saleAmountQuery = `
        SELECT SUM(price) AS total_sale_amount 
        FROM transactions 
        WHERE strftime('%m',dateOfSale)= '${month}'
    `

  // Query to get total number of sold items of selected month
  const soldItemsQuery = `
        SELECT COUNT(*) AS total_sold_items 
        FROM transactions 
        WHERE strftime('%m',dateOfSale)= '${month}' and sold = 1
    `

  // Query to get total number of not sold items of selected month
  const notSoldItemsQuery = `
        SELECT COUNT(*) AS total_not_sold_items 
        FROM transactions 
        WHERE strftime('%m',dateOfSale)= '${month}'
            AND sold = 0
    `

  // Execute all queries in parallel
  db.all(saleAmountQuery, (err, saleAmountResult) => {
    if (err) {
      res.status(500).json({error: err.message})
      return
    }

    db.all(soldItemsQuery, (err, soldItemsResult) => {
      if (err) {
        res.status(500).json({error: err.message})
        return
      }

      db.all(notSoldItemsQuery, (err, notSoldItemsResult) => {
        if (err) {
          res.status(500).json({error: err.message})
          return
        }

        const statistics = {
          total_sale_amount: saleAmountResult[0].total_sale_amount || 0,
          total_sold_items: soldItemsResult[0].total_sold_items || 0,
          total_not_sold_items: notSoldItemsResult[0].total_not_sold_items || 0,
        }

        res.json(statistics)
      })
    })
  })
})

// Endpoint for bar chart data based on price range for selected month
app.get('/bar_chart_data/:month', (req, res) => {
  const {month} = req.params

  // Query to get number of items falling in each price range for the selected month
  const barChartDataQuery = `
        SELECT 
            SUM(CASE WHEN price >= 0 AND price <= 100 THEN 1 ELSE 0 END) AS range_0_100,
            SUM(CASE WHEN price >= 101 AND price <= 200 THEN 1 ELSE 0 END) AS range_101_200,
            SUM(CASE WHEN price >= 201 AND price <= 300 THEN 1 ELSE 0 END) AS range_201_300,
            SUM(CASE WHEN price >= 301 AND price <= 400 THEN 1 ELSE 0 END) AS range_301_400,
            SUM(CASE WHEN price >= 401 AND price <= 500 THEN 1 ELSE 0 END) AS range_401_500,
            SUM(CASE WHEN price >= 501 AND price <= 600 THEN 1 ELSE 0 END) AS range_501_600,
            SUM(CASE WHEN price >= 601 AND price <= 700 THEN 1 ELSE 0 END) AS range_601_700,
            SUM(CASE WHEN price >= 701 AND price <= 800 THEN 1 ELSE 0 END) AS range_701_800,
            SUM(CASE WHEN price >= 801 AND price <= 900 THEN 1 ELSE 0 END) AS range_801_900,
            SUM(CASE WHEN price >= 901 THEN 1 ELSE 0 END) AS range_901_above
        FROM transactions 
        WHERE strftime('%m',dateOfSale)= '${month}' 
    `

  // Execute the query to fetch bar chart data
  db.get(barChartDataQuery, (err, result) => {
    if (err) {
      res.status(500).json({error: err.message})
      return
    }

    const barChartData = {
      range_0_100: result.range_0_100,
      range_101_200: result.range_101_200,
      range_201_300: result.range_201_300,
      range_301_400: result.range_301_400,
      range_401_500: result.range_401_500,
      range_501_600: result.range_501_600,
      range_601_700: result.range_601_700,
      range_701_800: result.range_701_800,
      range_801_900: result.range_801_900,
      range_901_above: result.range_901_above,
    }

    res.json(barChartData)
  })
})

// Endpoint for pie chart data based on unique categories for selected month
// Endpoint for pie chart data based on unique categories for selected month
app.get('/pie_chart_data/:month', (req, res) => {
  const {month} = req.params

  // Query to get unique categories and count of items from each category for the selected month
  const pieChartDataQuery = `
    SELECT category, COUNT(*) AS items_count
    FROM (
      SELECT DISTINCT category, dateOfSale
      FROM transactions 
      WHERE strftime('%m', dateOfSale) = '${month}'
    ) AS unique_categories
    GROUP BY category
  `

  // Execute the query to fetch pie chart data
  db.all(pieChartDataQuery, (err, rows) => {
    if (err) {
      res.status(500).json({error: err.message})
      return
    }

    const pieChartData = rows.map(row => ({
      category: row.category,
      items_count: row.items_count,
    }))

    res.json(pieChartData)
  })
})

// ... (Server setup and listener)

const port = 3000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
