let matrix = null;
let flags, limitFlags = null;
const button = document.querySelector('#btn')

ini()
function ini() {
  matrix = getMatrix(10, 10);
  flags = 10;
  limitFlags = flags;
  for (let i = 0; i < flags; i++) {
    setRandomMine(matrix);
  }
  play();
}
button.addEventListener('click', event => {
  ini();
  play();
  button.style.display = 'none';
})


function getMatrix (columns , rows) {
  const matrix = [];

  let idCounter = 1;

  for (let y = 0; y < rows; y++) {
    const row = [];

    for (let x = 0; x < columns; x++) {
      row.push({
        id: idCounter++,
        show: false,
        flag: false,
        mine: false,
        number: 0,
        x: x,
        y: y
      });
    }

    matrix.push(row);
  }

  return matrix
}

function getRandomFreeCell (matrix) {
  const freeCells = [];

  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      let cell = matrix[y][x]

      if (!cell.mine) {
        freeCells.push(cell)
      }
    }
  }

  const index = Math.floor(Math.random() * freeCells.length)
  return freeCells[index]
}

function setRandomMine (matrix) {
  const cell = getRandomFreeCell(matrix);
  const cells = getAroundCells(matrix, cell.x, cell.y);

  cell.mine = true;

  for (const cell of cells) {
    cell.number += 1;
  }
}


function getCell(matrix, x, y) {
  if (!matrix[y] || !matrix[y][x]) {
    return false
  }
  
  return matrix[y][x]
}

function getAroundCells(matrix, x, y) {
  const cells = [];

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) {
        continue
      }
      
      const cell = getCell(matrix, x + dx, y + dy)

      if (cell) {
        cells.push(cell);
      }
    }
  }
  return cells
}

function matrixToHTML (matrix) {
  let flagNumber = document.querySelector('p');
  flagNumber.innerText = `${limitFlags}/${flags}`;
  let gameElement = document.createElement('div');
  gameElement.classList.add('sapper');
  for (let y = 0; y < matrix.length; y++){
    const rowElement= document.createElement('div');
    rowElement.classList = 'rowCell'
    for (let x = 0; x < matrix[y].length; x++){
      const cell = matrix[y][x];
      const element = document.createElement('div');
      element.classList = 'cell'
      element.setAttribute('data-cell-id', cell.id)

      rowElement.append(element)
      if (!cell.show) {
        element.style.background = '#989898';
      }
      if (cell.show) {
      element.style.background = '#ffffff63';
      }
      if (cell.flag) {
        element.classList = 'cell flag';
      }
      if (cell.show && cell.mine) {
        element.style.background = '#ff0000';
        element.style.borderRadius = '15px';
        element.style.padding = '5px';
        element.style.margin = '5px';
        continue
      }
      if (cell.show && cell.number) {
        element.innerText = `${cell.number}`
        continue
      }
    
    gameElement.append(rowElement)
  }
}

  return gameElement
}

function play() {
  update()
  if (!isLosing(matrix)) {
    const element = document.querySelectorAll('.cell');
    element.forEach(elem =>{
      elem.addEventListener('mousedown', clickElement)
    })
  } 

  if (isLosing(matrix)) {
    boom(matrix);
    update()
    alert('Програв');
  } 
  else if (isWin(matrix)) {
    alert('Перемога');
  }
  
}
function update() {
  const gameElement = matrixToHTML(matrix);
  const appElement = document.querySelector('#app');

  appElement.oncontextmenu = () => false
  appElement.innerHTML = '';
  appElement.append(gameElement);
}

function setCellById(matrix, id) {
  for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        const cell = matrix[y][x];
        if (cell.id == id) {
          return cell
        }
      }
    }
  return false
}

function getInfo(event) {
  const elem = event.target;
  const cellId = elem.getAttribute('data-cell-id');

  return cellId
}

function showSpread(matrix, x, y) {
  const cell = getCell(matrix, x, y);
  if (cell.flag || cell.number || cell.mine) {
    return
  }

  matrix.forEach(x => x.point = false);

  cell.point = true;

  let flag = true;
  while (flag) {
    flag = false;

    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix.length; x++) {
        const cell = matrix[y][x];

        if (!cell.point || cell.number) {
          continue
        }

        const cells = getAroundCells(matrix, x, y);

        for (const cell of cells) {
          if (cell.point) {
            continue
          }

          if (!cell.flag && !cell.mine) {
            cell.point = true;
            flag = true;
          }
        }
      }
    }
  }
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      const cell = matrix[y][x];
      if (cell.point) {
        cell.show = true;
      }
      delete cell.point;
    }
  }
}

function clickElement(event) {
  button.style.display = 'block';
  const info = getInfo(event);
  let cell = setCellById(matrix, info);

  if (event.which === 1) 
  {
    if (!cell.show && !cell.flag) 
    {
      showSpread(matrix, cell.x, cell.y)
      cell.show = true;
      play();
    }
  } 
  else if (event.which === 3) 
  {
    if (!cell.show && limitFlags <= flags && limitFlags >= 0) 
    {
      if (cell.flag == false && limitFlags != 0) 
      {
        cell.flag = true;
        limitFlags--;
      } 
      else if (cell.flag == true) {
        cell.flag = false;
        limitFlags++;
      }
      play();
    }
  }
}

function isWin(matrix) {
  const flags = [];
  const mines = [];

  matrix.forEach(cell => {
    if (cell.flag) {
      flags.push(cell);
    }
    if (cell.mine) {
      mines.push(cell);
    }
  })

    if (flags.length !== mines.length) {
      return false
    }
    for (const cell of mines) {
      if (!cell.flag) {
        return false
      }
    }

  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      const cell = matrix[y][x];

      if (!cell.mine && !cell.show) {
        return false
      }
    }
  }
  return true
}
function isLosing(matrix) {
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      const cell = matrix[y][x];

      if (cell.mine && cell.show){
        return true
      }
    }
  }
  return false
}
function boom(matrix) {
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      const cell = matrix[y][x];

      if (cell.mine) {
        cell.show = true
      }
    }
  }
}


console.log(matrix);