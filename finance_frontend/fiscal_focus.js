// This function is using the GET route so that it can grab the account information from the account table in the database, through the backend and send to the frontend.
function getAccount() {
    fetch('http://127.0.0.1:5000/get_account')
    .then(response => response.json())
    .then(data => {
        const container = document.getElementById('accounts-container')
        // This is to show that the account that will be shown is the account that is being asked for and used by the user. So it changes to the account that the user is accessing. Hence why it is using the card to be updated and changed to the account that the user will access at any point they want and this will be used on the home page.
        data.forEach(account => {
            const card = document.createElement('div')
            card.className = 'card'
            card.innerHTML = `
            <a href="fiscal_account.html?id=${account.id}">
                ${account.account_name} - ${account.account_type}: $${account.balance}
            </a>
            `
            container.appendChild(card)
        });
        // This is to give the total balance of all of the accounts.
        const totalBalance = data.reduce((sum, account) => sum + account.balance, 0)
        const total = document.createElement('div')
        total.className = 'section'
        total.innerHTML = `<h3>Total Balance: $${totalBalance.toFixed(2)}</h3>`
        container.appendChild(total)
    })
}

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

// This section of the code is for the fiscal_account.html page.

// These are to ensure that the user can use the account that they want to view within the account html.
const params = new URLSearchParams(window.location.search)
const accountId = params.get('id')

// This function is ensuring the user is getting the detailed version of the account they want to access.
function getAccountDetail () {
    // This fetch call is grabbing info from the get_account route.
    if (!accountId) return
    fetch('http://127.0.0.1:5000/get_account')
    .then(response => response.json())
    .then(data => {
        // The const account is used to find the info for the account the user wants to access within the account html. The const detail is for getting the elements of the account's details. Then we have the const section that is acting as the sections of the info that is there to see of the accounts.
        const account = data.find(a => a.id === parseInt(accountId))
        const detail = document.getElementById('account-detail')
        const section = document.createElement('div')

        // These are to use the section to have the class name be organized and having the section of the h2 with the account's info.
        section.className = 'section'
        section.innerHTML = `
        <h2>
            ${account.account_name} - ${account.account_type}: $${account.balance}
        </h2> 
        <a href="fiscal_transaction.html?id=${account.id}">View All Transactions</a>
        `
        // This inserts the section into the account-detail div so it appears on the page.
        detail.appendChild(section)
    })
}

// This function is for the account html so that it can show the goal of the account. Each account should have their own goal and so on.
function getAccountGoal() {
    if (!accountId) return
    fetch('http://127.0.0.1:5000/get_account_goal')
    .then(response => response.json())
    .then(data => {
        // The fetch call is the same concept like the function above, along with the appendChild, and the call at the bottom of the function as well. But what makes this different from the previous function is how this is now filtering out the the accounts by each of the goals of the accounts. Then it is putting them in the goals-container which is where it should should be viewed for the user. 
        const accountGoals = data.filter(g => g.account_id === parseInt(accountId))
        const goal = document.getElementById('goals-container')

        // This is not quite the same either, as now this is now showing the data within the goal and allowing the user to view what they would like to change and view as far as the users goals are.
        accountGoals.forEach(accountGoal => {
            const section = document.createElement('div')
            section.className = 'section'
            section.innerHTML = `
            <div>
                ${accountGoal.goal_name}. Goal Target: $${accountGoal.goal_target} - Current Amount: $${accountGoal.current_amount}
            </div>`
            goal.appendChild(section)
        })
    })
}

// This function is for the account html but it will show the most recent transactions of the the account, the 5 most recent transactions to be exact.
function getRecentTransaction() {
    if (!accountId) return
    fetch('http://127.0.0.1:5000/get_transactions')
    .then(response => response.json())
    .then(data => {
        // The fetch call is once again the same concept and this will be the same for the rest of the functions unless something unique is needing to happen, the same goes for the appendChild and the call at the bottom of the function. This function is still filtering by the accounts but now it will use those accounts to see the transactions of the account that it is filtered by. As it is grabbing those transactions, it is grabbing the 5 most recent transactions. From there it will be the same as the previous function with adjustments to be given appropriately.
        const recentTransactions = data.filter(r => r.account_id === parseInt(accountId))
        const lastFive = recentTransactions.slice(-5)
        const recent = document.getElementById('recent-transactions')

        lastFive.forEach(recentTransaction => {
            const section = document.createElement('div')
            section.className = 'section'
            section.innerHTML = `
            <div>
                ${recentTransaction.date} ${recentTransaction.name} - ${recentTransaction.transaction_type} $${recentTransaction.amount}
            </div>`
            recent.appendChild(section)
        })
    })
}

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

// This will be for the Transactions page.

// This function is to show all of the transactions of the account that is being accessed. It does this by using a fetch call to the get_transactions.
function getAllTransactions() {
    fetch('http://127.0.0.1:5000/get_transactions')
    .then(response => response.json())
    .then(data => {
        // This is not needed to be redeclared as this page will have the accountId at the top of this file so that it can be in the URL of this page.
        const allTransactions = data.filter(t => t.account_id === parseInt(accountId))
        const all = document.getElementById('transactions-container')

        // Everything is the same as before but for the transactions function and for the transactions page as well. This also has the delete button so that it can delete the transaction if needed. This lets the user make adjustments.
        all.innerHTML = '<h2>Transactions</h2>'
        allTransactions.forEach(allTransaction => {
            const section = document.createElement('div')
            section.className = 'section'
            section.innerHTML = `
            <div>
                ${allTransaction.date} ${allTransaction.name} - ${allTransaction.transaction_type} $${allTransaction.amount} <button class="delete-btn" onclick="deleteTransactions(${allTransaction.id})">Delete</button>
            </div>`
            all.appendChild(section)
        })

        // This is to make a dropdown list of the categories for adding the transaction to the account.
        fetch('http://127.0.0.1:5000/get_categories')
        .then(r => r.json())
        .then(categories => {
            const dropdown = document.getElementById('category-type')
            categories.forEach(category => {
                const option = document.createElement('option')
                option.value = category.id
                option.textContent = category.category_name
                dropdown.appendChild(option)
            }) 
        })
    })
}

// This function is to give the forms of a transaction so that it can be filled in by the user and then added to the correct balance of the accounts. That is why there is 2 fetch calls within this function, one bieng the transactions and balances.
function addTransaction() {
    const date = document.getElementById('transaction-date').value
    const name = document.getElementById('transaction-name').value
    const amount = document.getElementById('transaction-amount').value
    const transactionType = document.getElementById('transaction-type').value
    const categoryType = document.getElementById('category-type').value
    
    Promise.all([
        fetch('http://127.0.0.1:5000/add_transactions', {
            method: 'POST',
            headers: {'Content-type': 'application/json'},
            body: JSON.stringify({
                date: date,
                name: name,
                amount: amount,
                transaction_type: transactionType,
                account_id: parseInt(accountId),
                categories_id: parseInt(categoryType)
            })
        }).then(r => r.json()),
        fetch('http://127.0.0.1:5000/update_balance', {
            method: 'PUT',
            headers: {'Content-type': 'application/json'},
            body: JSON.stringify({
                account_id: parseInt(accountId),
                transaction_type: transactionType,
                amount: amount
            })
        }
        ).then(r => r.json())
    ])
    .then(() => {
        // This allows the transaction list to be refreshed and hides the forms when the forms has been successfully submitted.
        getAllTransactions()
        document.getElementById('transaction-form').style.display = 'none'
    })
}

// This is the delete function for a transaction that the user can use in the transaction page.
function deleteTransactions(transaction_id) {
    fetch(`http://127.0.0.1:5000/delete_transactions/${transaction_id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        getAllTransactions()
    })
}

// This is for the forms in the app to be able to be used and seen when it is supposed to be seen.
function showForm(formId) {
    const form = document.getElementById(formId)
    form.style.display = form.style.display === 'none' ? 'block' : 'none'
}

// This was done so that it was organized with each function being called within each of the HTML pages. As each is being accessed within each of the pages it is being called to these functions appropriately as it gives the path of each HTML page if they are being called with those functions.
const path = window.location.pathname
if (path.includes('fiscal_home') || path.endsWith('/')) {
    getAccount()
    getChart()
}

if (path.includes('fiscal_account') && !path.includes('fiscal_transaction')) {
    getAccountDetail()
    getAccountGoal()
    getRecentTransaction()
    getAccountChart()
}

if (path.includes('fiscal_transaction')) {
    getAccountDetail()
    getAllTransactions()
}