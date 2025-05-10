const expenseForm = document.getElementById('expense-form');
const expenseTable = document.querySelector('#expense-table tbody');
const totalExpensesSpan = document.getElementById('total-expenses');
const categoryFilter = document.getElementById('category-filter');
const dateFilter = document.getElementById('date-filter');

let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

// Charts
let categoryChart, trendChart;

function updateTotal(filteredExpenses = expenses) {
    const total = filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    totalExpensesSpan.textContent = `$${total.toFixed(2)}`;
}

function renderTable(filteredExpenses = expenses) {
    expenseTable.innerHTML = '';
    filteredExpenses.forEach((expense, index) => {
        const row = expenseTable.insertRow();
        row.innerHTML = `
            <td>${expense.name}</td>
            <td>${expense.category}</td>
            <td>$${parseFloat(expense.amount).toFixed(2)}</td>
            <td>${expense.date}</td>
            <td>
                <button onclick="editExpense(${index})">Edit</button>
                <button onclick="deleteExpense(${index})">Delete</button>
            </td>
        `;
    });
    updateTotal(filteredExpenses);
    drawCategoryChart(filteredExpenses);
    drawTrendChart(filteredExpenses);
}

function addExpense(e) {
    e.preventDefault();
    const name = document.getElementById('expense-name').value;
    const amount = document.getElementById('expense-amount').value;
    const category = document.getElementById('expense-category').value;
    const date = document.getElementById('expense-date').value;

    if (name && amount && category && date) {
        expenses.push({ name, amount, category, date });
        localStorage.setItem('expenses', JSON.stringify(expenses));
        expenseForm.reset();
        applyFilters();
    }
}

function editExpense(index) {
    const e = expenses[index];
    document.getElementById('expense-name').value = e.name;
    document.getElementById('expense-amount').value = e.amount;
    document.getElementById('expense-category').value = e.category;
    document.getElementById('expense-date').value = e.date;

    expenses.splice(index, 1);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    applyFilters();
}

function deleteExpense(index) {
    expenses.splice(index, 1);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    applyFilters();
}

function applyFilters() {
    const categoryVal = categoryFilter.value;
    const dateVal = dateFilter.value;

    const filtered = expenses.filter(expense => {
        const matchCategory = !categoryVal || expense.category === categoryVal;
        const matchDate = !dateVal || expense.date === dateVal;
        return matchCategory && matchDate;
    });

    renderTable(filtered);
}

// Chart rendering
function drawCategoryChart(filteredExpenses) {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    const categoryData = {};

    filteredExpenses.forEach(e => {
        categoryData[e.category] = (categoryData[e.category] || 0) + parseFloat(e.amount);
    });

    const data = {
        labels: Object.keys(categoryData),
        datasets: [{
            label: 'Expenses by Category',
            data: Object.values(categoryData),
            backgroundColor: ['#3498db', '#e74c3c', '#f1c40f', '#2ecc71', '#9b59b6']
        }]
    };

    if (categoryChart) categoryChart.destroy();
    categoryChart = new Chart(ctx, {
        type: 'pie',
        data: data
    });
}

function drawTrendChart(filteredExpenses) {
    const ctx = document.getElementById('trendChart').getContext('2d');
    const dateTotals = {};

    filteredExpenses.forEach(e => {
        dateTotals[e.date] = (dateTotals[e.date] || 0) + parseFloat(e.amount);
    });

    const dates = Object.keys(dateTotals).sort();
    const totals = dates.map(date => dateTotals[date]);

    const data = {
        labels: dates,
        datasets: [{
            label: 'Expenses Over Time',
            data: totals,
            borderColor: '#3498db',
            backgroundColor: 'rgba(52, 152, 219, 0.2)',
            fill: true,
            tension: 0.4
        }]
    };

    if (trendChart) trendChart.destroy();
    trendChart = new Chart(ctx, {
        type: 'line',
        data: data
    });
}

// Event listeners
expenseForm.addEventListener('submit', addExpense);
categoryFilter.addEventListener('change', applyFilters);
dateFilter.addEventListener('change', applyFilters);

// Initial render
renderTable();
