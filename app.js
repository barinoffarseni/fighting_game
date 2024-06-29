canvas = document.querySelector('canvas')
ctx = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

ctx.fillStyle = "red";
ctx.fillRect(0, 0, canvas.width, canvas.height)
ctx.fillStyle = "green";
ctx.fillRect(canvas.width / 2, 0, canvas.width, canvas.height)
ctx.fillStyle = "blue";
ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height)
ctx.fillStyle = "yellow";
ctx.fillRect(canvas.width / 2, canvas.height / 2, canvas.width, canvas.height)