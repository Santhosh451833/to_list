document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const prioritySelect = document.getElementById('prioritySelect');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const clearCompletedBtn = document.getElementById('clearCompletedBtn');

    let currentFilter = 'all'; // Default filter

    // Load tasks from local storage when the page loads
    loadTasks();
    applyFilter(currentFilter); // Apply initial filter

    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Event delegation for handling clicks on task items (complete/delete)
    taskList.addEventListener('click', (e) => {
        if (e.target.classList.contains('task-text') || e.target.classList.contains('task-meta')) {
            // If clicking on text or meta, toggle completion
            const listItem = e.target.closest('li');
            if (listItem) {
                listItem.classList.toggle('completed');
                saveTasks();
                applyFilter(currentFilter); // Re-apply filter to update display
            }
        } else if (e.target.classList.contains('delete-btn')) {
            // If clicking on delete button
            e.target.closest('li').remove(); // Remove the parent <li> element
            saveTasks();
            applyFilter(currentFilter); // Re-apply filter
        }
    });

    // Event delegation for double-clicking to edit
    taskList.addEventListener('dblclick', (e) => {
        const listItem = e.target.closest('li');
        if (listItem && (e.target.classList.contains('task-text') || e.target.classList.contains('task-meta'))) {
            editTask(listItem);
        }
    });

    // Filter buttons event listeners
    filterBtns.forEach(button => {
        button.addEventListener('click', () => {
            filterBtns.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.filter;
            applyFilter(currentFilter);
        });
    });

    // Clear Completed button event listener
    clearCompletedBtn.addEventListener('click', () => {
        taskList.querySelectorAll('li.completed').forEach(task => task.remove());
        saveTasks();
        applyFilter(currentFilter); // Re-apply filter in case all tasks were completed
    });


    function addTask() {
        const taskText = taskInput.value.trim();
        const priority = prioritySelect.value;
        const timestamp = new Date().toLocaleString(); // Simple timestamp

        if (taskText !== '') {
            const listItem = document.createElement('li');
            listItem.setAttribute('data-priority', priority);
            listItem.setAttribute('data-timestamp', timestamp); // Store timestamp
            listItem.setAttribute('data-completed', 'false'); // Initial completion status

            const taskContent = document.createElement('div');
            taskContent.classList.add('task-content');

            const taskTextSpan = document.createElement('span');
            taskTextSpan.classList.add('task-text');
            taskTextSpan.textContent = taskText;

            const taskMetaSpan = document.createElement('span');
            taskMetaSpan.classList.add('task-meta');
            taskMetaSpan.innerHTML = `Added: ${timestamp} | Priority: <span class="priority-text">${priority}</span>`;

            taskContent.appendChild(taskTextSpan);
            taskContent.appendChild(taskMetaSpan);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('delete-btn');

            listItem.appendChild(taskContent);
            listItem.appendChild(deleteButton);
            taskList.appendChild(listItem);

            taskInput.value = ''; // Clear the input field
            prioritySelect.value = 'medium'; // Reset priority
            saveTasks(); // Save tasks after adding
            applyFilter(currentFilter); // Update display based on current filter
        } else {
            alert('Please enter a task!');
        }
    }

    function editTask(listItem) {
        const taskTextElement = listItem.querySelector('.task-text');
        const oldText = taskTextElement.textContent;

        // Create an input field
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.classList.add('edit-input');
        editInput.value = oldText;

        // Replace the task text with the input field
        taskTextElement.replaceWith(editInput);
        editInput.focus(); // Focus the input
        editInput.select(); // Select all text

        // Save changes on blur or Enter key
        const saveEdit = () => {
            const newText = editInput.value.trim();
            if (newText !== '') {
                taskTextElement.textContent = newText; // Update text
                listItem.querySelector('.task-meta').innerHTML = `Added: ${listItem.dataset.timestamp} | Priority: <span class="priority-text">${listItem.dataset.priority}</span>`; // Re-render meta
                editInput.replaceWith(taskTextElement); // Put the span back
                saveTasks();
            } else {
                alert('Task cannot be empty. Reverting to original text.');
                editInput.replaceWith(taskTextElement); // Revert
            }
        };

        editInput.addEventListener('blur', saveEdit);
        editInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                editInput.removeEventListener('blur', saveEdit); // Prevent blur from firing twice
                saveEdit();
            }
        });
    }


    function saveTasks() {
        const tasks = [];
        taskList.querySelectorAll('li').forEach(li => {
            tasks.push({
                text: li.querySelector('.task-text').textContent,
                completed: li.classList.contains('completed'),
                priority: li.dataset.priority,
                timestamp: li.dataset.timestamp
            });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks'));
        if (tasks) {
            tasks.forEach(task => {
                const listItem = document.createElement('li');
                listItem.setAttribute('data-priority', task.priority);
                listItem.setAttribute('data-timestamp', task.timestamp);
                listItem.setAttribute('data-completed', task.completed ? 'true' : 'false');


                if (task.completed) {
                    listItem.classList.add('completed');
                }

                const taskContent = document.createElement('div');
                taskContent.classList.add('task-content');

                const taskTextSpan = document.createElement('span');
                taskTextSpan.classList.add('task-text');
                taskTextSpan.textContent = task.text;

                const taskMetaSpan = document.createElement('span');
                taskMetaSpan.classList.add('task-meta');
                taskMetaSpan.innerHTML = `Added: ${task.timestamp} | Priority: <span class="priority-text">${task.priority}</span>`;

                taskContent.appendChild(taskTextSpan);
                taskContent.appendChild(taskMetaSpan);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.classList.add('delete-btn');

                listItem.appendChild(taskContent);
                listItem.appendChild(deleteButton);
                taskList.appendChild(listItem);
            });
        }
    }

    function applyFilter(filter) {
        taskList.querySelectorAll('li').forEach(li => {
            const isCompleted = li.classList.contains('completed');
            li.style.display = 'flex'; // Show by default, then hide if needed

            if (filter === 'active' && isCompleted) {
                li.style.display = 'none';
            } else if (filter === 'completed' && !isCompleted) {
                li.style.display = 'none';
            }
            // 'all' filter shows all, which is the default display
        });
    }
});