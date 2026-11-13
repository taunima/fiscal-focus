// The pages themselves (accounts, goals, transactions, and the add-transaction form) are now built by Flask templates.
// This file only handles what still needs JavaScript in the browser: drawing the charts, deleting a transaction, and showing/hiding the form.

// This function is making the pie chart to show what the user is spending money on.
function getChart() {
    fetch('http://127.0.0.1:5000/spending_by_category')
    .then(response => response.json())
    .then(rows => {
        const labels = rows.map(row => row.category_name)
        const chartData = rows.map(row => row.total_spent)
        const palette = ['#2B2118', '#CE8D66', '#228CDB', '#BA324F', '#801A86', '#2A7F62']
        const ctx = document.getElementById('spending-chart-canvas').getContext('2d')
        
        // The chart is created and each color is assoicated with each spending category so that the chart can be organized using the variables above. Each label connected to each color on the palette and the total amount spent is shown across all of the accounts.
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: chartData,
                    backgroundColor: rows.map(row => palette[(row.id - 1) % palette.length])
                }]
            },
            options: {plugins: {legend: {labels: {color: '#FFFFFF'}}}}
        })
    })
}

// The account id now comes from the data-account-id attribute that Flask puts on the <body> tag, instead of from ?id= in the URL.
const accountId = document.body.dataset.accountId

// Like the getChart above this is making and showin the spending chart, but with this function it is now showing a chart for a certain account.
function getAccountChart() {
    // It will still need to be do all of what the previouse chart will do except for the one detail of getting the chart for the specific account that the user will want to view. For this reason that is why everything else is the same with that one added detail of the const accountTransactions.
    if (!accountId) return
    Promise.all([
        fetch('http://127.0.0.1:5000/get_transactions').then(r => r.json()),
        fetch('http://127.0.0.1:5000/get_categories').then(r => r.json())
    ])
    .then(([transactions, categories]) => {
        // This is the only detail that is added so that it can show the specific account that will render the spending chart. Everything else is the same setup as the getChart() function.
        const accountTransactions = transactions.filter(t => t.account_id === parseInt(accountId))
        const spendingByCategory = {}
        accountTransactions.forEach(transaction => {
            const categoryId = transaction.categories_id
            if (transaction.transaction_type.toLowerCase() !== 'withdrawal') return
            if (spendingByCategory[categoryId]) {
                spendingByCategory[categoryId] += transaction.amount
            } else {
                spendingByCategory[categoryId] = transaction.amount
            }
        })

        const labels = categories.map(category => {
            return spendingByCategory[category.id] ? category.category_name : null
        }).filter(label => label != null)

        const chartData = categories
            .filter(category => spendingByCategory[category.id])
            .map(category => spendingByCategory[category.id])

        const ctx = document.getElementById('spending-chart-canvas').getContext('2d')

        // This is needed here for this function because it is doing the same as the getChart() function in addition to it also being assigned labels to each of the colors. This is to create uniformity across all of the charts.
        const CATEGORY_COLORS = {}
        function buildCategoryColors(categories) {
            const palette = [
                '#2B2118', '#CE8D66', '#228CDB', '#BA324F', '#801A86', '#2A7F62'
            ]
            categories.forEach((category, index) => {
                CATEGORY_COLORS[category.id] = palette[index % palette.length]
            })
        }
        buildCategoryColors(categories)

        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: chartData,
                    backgroundColor: categories
                    .filter(category => spendingByCategory[category.id])
                    .map(category => CATEGORY_COLORS[category.id])
                }]
            },
            options: {
                plugins: {
                    legend: {
                        labels: {
                            color: '#FFFFFF'
                        }
                    }
                }
            }
        })
    })
}

// This is the delete function for a transaction that the user can use in the transaction page.
function deleteTransactions(transaction_id) {
    fetch(`http://127.0.0.1:5000/delete_transactions/${transaction_id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        // The transaction list is built by Flask now, so reloading the page asks the server for the updated list.
        window.location.reload()
    })
}

// This is for the forms in the app to be able to be used and seen when it is supposed to be seen.
function showForm(formId) {
    const form = document.getElementById(formId)
    form.style.display = form.style.display === 'none' ? 'block' : 'none'
}

// Each template sets data-page on the <body> tag, so this checks which page is open and only runs the functions that page needs.
const page = document.body.dataset.page
if (page === 'home') {
    getChart()
}

if (page === 'account') {
    getAccountChart()
}
