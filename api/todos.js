const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data.json');

function readTodos() {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
}

function writeTodos(todos) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2), 'utf-8');
}

module.exports = (req, res) => {
    // 设置 CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 处理预检请求
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const urlParts = req.url.split('/');
    const id = urlParts.length > 2 ? parseInt(urlParts[urlParts.length - 1]) : null;

    // GET：获取所有事项
    if (req.method === 'GET') {
        const todos = readTodos();
        return res.json(todos);
    }

    // POST：新增事项
    if (req.method === 'POST') {
        const todos = readTodos();
        const newTodo = req.body;
        newTodo.id = todos.length > 0 ? todos[todos.length - 1].id + 1 : 1;
        todos.push(newTodo);
        writeTodos(todos);
        return res.status(201).json(newTodo);
    }

    // PATCH：更新完成状态
    if (req.method === 'PATCH' && id) {
        const todos = readTodos();
        const todo = todos.find(t => t.id === id);
        if (todo) {
            todo.completed = req.body.completed;
            writeTodos(todos);
            return res.json(todo);
        }
        return res.status(404).json({ error: '事项不存在' });
    }

    // DELETE：删除事项
    if (req.method === 'DELETE' && id) {
        const todos = readTodos();
        const index = todos.findIndex(t => t.id === id);
        if (index !== -1) {
            todos.splice(index, 1);
            writeTodos(todos);
            return res.json({ message: '删除成功' });
        }
        return res.status(404).json({ error: '事项不存在' });
    }

    return res.status(404).json({ error: '路由不存在' });
};