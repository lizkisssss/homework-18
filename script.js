let studentsData = {
    "students": [
        {
            "id": 1,
            "name": "Ivan Petrenko",
            "age": 15,
            "course": "Web Development",
            "skills": ["HTML", "CSS", "JavaScript"],
            "email": "ivan.petrenko@example.com",
            "isEnrolled": true
        },
        {
            "id": 2,
            "name": "Olha Kovalenko",
            "age": 16,
            "course": "Game Development",
            "skills": ["C#", "Unity"],
            "email": "olha.kovalenko@example.com",
            "isEnrolled": true
        },
        {
            "id": 3,
            "name": "Dmytro Shevchenko",
            "age": 14,
            "course": "Mobile App Development",
            "skills": ["Java", "Kotlin", "Android Studio"],
            "email": "dmytro.shevchenko@example.com",
            "isEnrolled": false
        },
        {
            "id": 4,
            "name": "Anastasia Ivanova",
            "age": 17,
            "course": "Data Science",
            "skills": ["Python", "Pandas", "Machine Learning"],
            "email": "anastasia.ivanova@example.com",
            "isEnrolled": true
        },
        {
            "id": 5,
            "name": "Mykola Bondarenko",
            "age": 15,
            "course": "Cybersecurity",
            "skills": ["Networking", "Ethical Hacking", "Linux"],
            "email": "mykola.bondarenko@example.com",
            "isEnrolled": true
        }
    ]
};
const studentsTableBody = document.querySelector('#students-table tbody');
const getStudentsBtn = document.getElementById('get-students-btn');
const addStudentForm = document.getElementById('add-student-form');

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getStudents() {
    try {
        await delay(500);
        console.log("GET /students: Отримано дані.");
        return studentsData.students;
    } catch (error) {
        console.error("Помилка у getStudents:", error);
        throw error;
    }
}

function renderStudents(students) {
    studentsTableBody.innerHTML = ''; 

    if (students.length === 0) {
        studentsTableBody.innerHTML = '<tr><td colspan="9">Список студентів порожній.</td></tr>';
        return;
    }

    students.forEach(student => {
        const row = studentsTableBody.insertRow();
        row.dataset.id = student.id;

        row.innerHTML = `
            <td>${student.id}</td>
            <td class="student-name">${student.name}</td>
            <td class="student-age">${student.age}</td>
            <td class="student-course">${student.course}</td>
            <td class="student-skills">${student.skills.join(', ')}</td>
            <td class="student-email">${student.email}</td>
            <td class="student-enrolled">${student.isEnrolled ? 'Так' : 'Ні'}</td>
            <td>
                <button class="update-btn" data-id="${student.id}">Оновити</button>
            </td>
            <td>
                <button class="delete-btn" data-id="${student.id}">Видалити</button>
            </td>
        `;
        row.querySelector('.update-btn').addEventListener('click', () => handleUpdateStudentClick(student));
        row.querySelector('.delete-btn').addEventListener('click', () => deleteStudent(student.id));
    });
}

async function addStudent(e) {
    e.preventDefault();

    try {
        const name = document.getElementById('name').value;
        const age = parseInt(document.getElementById('age').value);
        const course = document.getElementById('course').value;
        const skills = document.getElementById('skills').value.split(',').map(s => s.trim()).filter(s => s.length > 0);
        const email = document.getElementById('email').value;
        const isEnrolled = document.getElementById('isEnrolled').checked;

        const newStudent = {
            id: Math.max(0, ...studentsData.students.map(s => s.id)) + 1, 
            name,
            age,
            course,
            skills,
            email,
            isEnrolled
        };

        await delay(500);
        
        studentsData.students.push(newStudent);
        console.log(`POST /students: Додано студента з ID ${newStudent.id}`);

        await loadAndRenderStudents(); 
        
        addStudentForm.reset();
        alert(`Студента ${name} успішно додано!`);

    } catch (error) {
        console.error('Помилка при додаванні студента:', error);
        alert('Помилка при додаванні студента. Дивіться консоль.');
    }
}

function handleUpdateStudentClick(student) {
    const row = studentsTableBody.querySelector(`tr[data-id="${student.id}"]`);
    if (!row) return;
    const updateRow = studentsTableBody.insertRow(row.rowIndex - 1);
    updateRow.id = `update-form-${student.id}`;
    updateRow.innerHTML = `
        <td colspan="9">
            <form class="update-student-form">
                <input type="hidden" name="id" value="${student.id}">
                <label>Ім'я: <input type="text" name="name" value="${student.name}" required></label>
                <label>Вік: <input type="number" name="age" value="${student.age}" required></label>
                <label>Курс: <input type="text" name="course" value="${student.course}" required></label>
                <label>Навички (через кому): <input type="text" name="skills" value="${student.skills.join(', ')}" required></label>
                <label>Email: <input type="email" name="email" value="${student.email}" required></label>
                <label>Записаний: <input type="checkbox" name="isEnrolled" ${student.isEnrolled ? 'checked' : ''}></label>
                <button type="submit" class="save-update-btn">Зберегти зміни</button>
                <button type="button" class="cancel-update-btn">Скасувати</button>
            </form>
        </td>
    `;
    row.style.display = 'none';
    updateRow.querySelector('.update-student-form').addEventListener('submit', async (e) => { // Додаємо async тут
        e.preventDefault();
        const formData = new FormData(e.target);
        const updatedData = {
            id: student.id,
            name: formData.get('name'),
            age: parseInt(formData.get('age')),
            course: formData.get('course'),
            skills: formData.get('skills').split(',').map(s => s.trim()).filter(s => s.length > 0),
            email: formData.get('email'),
            isEnrolled: formData.get('isEnrolled') === 'on' ? true : false
        };
        await updateStudent(student.id, updatedData, row, updateRow); 
    });
    updateRow.querySelector('.cancel-update-btn').addEventListener('click', () => {
        updateRow.remove();
        row.style.display = 'table-row';
    });
}
async function updateStudent(id, updatedData, originalRow, updateFormRow) {
    try {
        const studentIndex = studentsData.students.findIndex(s => s.id === id);

        if (studentIndex === -1) {
            throw new Error('Студента не знайдено!');
        }

        await delay(500);
        const updatedStudent = { ...studentsData.students[studentIndex], ...updatedData };
        studentsData.students[studentIndex] = updatedStudent;
        console.log(`PATCH /students/${id}: Оновлено дані.`);
        
        await loadAndRenderStudents(); 
        
        alert(`Студента ${updatedStudent.name} (ID: ${id}) успішно оновлено!`);
        updateFormRow.remove(); 
        originalRow.style.display = 'table-row';

    } catch (error) {
        console.error(`Помилка при оновленні студента з ID ${id}:`, error);
        alert(`Помилка при оновленні студента з ID ${id}: ${error.message}`);
        if (updateFormRow) updateFormRow.remove();
        if (originalRow) originalRow.style.display = 'table-row';
    }
}

async function deleteStudent(id) {
    if (!confirm(`Ви впевнені, що хочете видалити студента з ID ${id}?`)) {
        return;
    }
    
    try {
        const studentIndex = studentsData.students.findIndex(s => s.id === id);

        if (studentIndex === -1) {
            throw new Error('Студента не знайдено!');
        }

        await delay(500);

        const [deletedStudent] = studentsData.students.splice(studentIndex, 1);
        console.log(`DELETE /students/${id}: Видалено.`);
        
        await loadAndRenderStudents();

        alert(`Студента ${deletedStudent.name} (ID: ${id}) успішно видалено!`);

    } catch (error) {
        console.error(`Помилка при видаленні студента з ID ${id}:`, error);
        alert(`Помилка при видаленні студента з ID ${id}: ${error.message}`);
    }
}
async function loadAndRenderStudents() {
    try {
        const students = await getStudents(); 
        renderStudents(students);
    } catch (error) {
        console.error('Помилка при завантаженні студентів:', error);
        studentsTableBody.innerHTML = '<tr><td colspan="9">Не вдалося завантажити дані студентів.</td></tr>';
    }
}
getStudentsBtn.addEventListener('click', loadAndRenderStudents);
addStudentForm.addEventListener('submit', addStudent);
document.addEventListener('DOMContentLoaded', loadAndRenderStudents);