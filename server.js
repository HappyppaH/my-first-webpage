const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const DATA_FILE = path.join(__dirname,'data.json');
function readTodos(){
    const raw =fs.readFileSync(DATA_FILE,'utf-8');
    return JSON.parse(raw);
}
function writeTodos(todos){
    fs.writeFileSync(DATA_FILE,JSON.stringify(todos,null,2),'utf-8');
}
const cors = require('cors');
app.use(cors());
app.use(express.json());
app.get('/',(req,res)=>{
    res.send('你好！这是我第一个服务器返回的文章。');
});
app.get('/api/todos',(req,res)=>{
    const todos=readTodos();    
    res.json(todos);
});
app.post('/api/todos',(req,res)=>{
    const todos =readTodos();
    const newTodo =req.body;
    newTodo.id=todos.length>0?todos[todos.length-1].id+1:1;
    todos.push(newTodo);
    writeTodos(todos);
    res.status(201).json(newTodo);
});
app.delete('/api/todos/:id', (req, res) => {
    const todos=readTodos();
    const id =parseInt(req.params.id);
    const index =todos.findIndex(t=>t.id===id);
    if(index!== -1){
        todos.splice(index,1);
        writeTodos(todos);
        res.json({message:'删除成功'});
    }else{
        res.status(404).json({error:'事项不存在'});
    }
});
const PORT = 3000;
app.patch('/api/todos/:id', (req, res) =>{
    const todos=readTodos();
    const id=parseInt(req.params.id);
    const todo=todos.find(t=>t.id===id);
    if(todo){
        todo.completed=req.body.completed;
        writeTodos(todos);
        res.json(todo);
    }else{
        res.status(404).json({error:'事项不存在'});
    }
});
app.listen(PORT,()=>{
    console.log(`✅ 服务器已启动：http://localhost:${PORT}`);
});