document.addEventListener('DOMContentLoaded', () => {
    const expenseForm = document.getElementById('expense-form');
    const expensesContainer = document.getElementById('expenses-container');
    const totalAmountEl = document.getElementById('total-amount');
    
    // Set today's date as default
    document.getElementById('date').valueAsDate = new Date();

    // Fetch and display expenses
    async function fetchExpenses() {
        try {
            const response = await fetch('/api/expenses');
            if (!response.ok) throw new Error('Failed to fetch expenses');
            const expenses = await response.json();
            renderExpenses(expenses);
            updateTotal(expenses);
        } catch (error) {
            console.error('Error fetching expenses:', error);
            expensesContainer.innerHTML = '<div class="empty-state">Failed to load expenses.</div>';
        }
    }

    // Render expenses list
    function renderExpenses(expenses) {
        if (expenses.length === 0) {
            expensesContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-receipt"></i>
                    <p>No expenses found. Add one above!</p>
                </div>
            `;
            return;
        }

        expensesContainer.innerHTML = expenses.map(expense => `
            <div class="expense-card" data-id="${expense.id}">
                <div class="expense-info">
                    <div class="expense-title">${escapeHTML(expense.title)}</div>
                    <div class="expense-meta">
                        <span class="category-tag">${escapeHTML(expense.category)}</span>
                        <span><i class="fa-regular fa-calendar"></i> ${formatDate(expense.date)}</span>
                    </div>
                </div>
                <div class="expense-actions">
                    <div class="expense-amount">$${parseFloat(expense.amount).toFixed(2)}</div>
                    <button class="btn-delete" onclick="deleteExpense(${expense.id})" title="Delete Expense">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Update total amount
    function updateTotal(expenses) {
        const total = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
        totalAmountEl.textContent = `$${total.toFixed(2)}`;
    }

    // Add new expense
    expenseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const newExpense = {
            title: document.getElementById('title').value,
            amount: parseFloat(document.getElementById('amount').value),
            category: document.getElementById('category').value,
            date: document.getElementById('date').value
        };

        try {
            const response = await fetch('/api/expenses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newExpense)
            });

            if (!response.ok) throw new Error('Failed to add expense');
            
            // Reset form except date
            expenseForm.reset();
            document.getElementById('date').valueAsDate = new Date();
            
            // Refresh list
            fetchExpenses();
        } catch (error) {
            console.error('Error adding expense:', error);
            alert('Failed to add expense. Please try again.');
        }
    });

    // Delete expense (global function so onclick can access it)
    window.deleteExpense = async (id) => {
        if (!confirm('Are you sure you want to delete this expense?')) return;
        
        try {
            const response = await fetch(`/api/expenses/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete expense');
            
            // Add fade-out animation before refreshing
            const card = document.querySelector(`.expense-card[data-id="${id}"]`);
            if (card) {
                card.style.opacity = '0';
                card.style.transform = 'translateX(-20px)';
                setTimeout(fetchExpenses, 300);
            } else {
                fetchExpenses();
            }
        } catch (error) {
            console.error('Error deleting expense:', error);
            alert('Failed to delete expense. Please try again.');
        }
    };

    // Helper: format date
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    // Helper: escape HTML to prevent XSS
    function escapeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Initial fetch
    fetchExpenses();
});
