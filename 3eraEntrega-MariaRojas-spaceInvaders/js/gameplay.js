document.addEventListener('DOMContentLoaded', () => {
  const name = localStorage.getItem('name');
  const comision = localStorage.getItem('comision')

  if (!name || !comision) {
    window.location.href = "/html/name.html"
    return;
  }

  document.querySelector('#user').textContent = name;


  const gridElements = document.querySelectorAll('.grid div')
  const resultDisplay = document.querySelector('#result')
  const config = JSON.parse(document.getElementById('config').textContent)
  let { shooterIndex, width } = config
  let invaderIndex = 0
  let deadInvaderIdxs = []
  let result = 0
  let direction = 1
  let invadeId
  let gameover = false;


  //invaders///

  const alienInvaderPos = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
    30, 31, 32, 33, 34, 35, 36, 37, 38, 39
  ]

  ///draw the aliens///

  alienInvaderPos.forEach(invader => addInvaderClass(gridElements[invaderIndex + invader]))

  ///draw the sooter///

  addClass(gridElements[shooterIndex], 'shooter')

  ///move shooter///

  // TODO create addShooterClass and removeShooterClass and replace usage
  function moveShooter(e) {
    if (gameover) return;
    const { code } = e;
    removeClass(gridElements[shooterIndex], 'shooter')
    switch (code) {
      case 'ArrowLeft':
        if(shooterIndex % width !== 0) shooterIndex -=1
        break
      case 'ArrowRight':
        if(shooterIndex % width < width -1) shooterIndex +=1
        break
    }
    gridElements[shooterIndex].classList.add('shooter')
  }
  document.addEventListener('keydown', moveShooter)

  ////move invaders////

  function moveInvaders() {
    const [first, ...rest] = alienInvaderPos;
    const [last] = rest.reverse()
    const leftEdge = first % width === 0
    const rightEdge = last % width === width - 1
    
    if ((leftEdge && direction === -1) || (rightEdge && direction === 1)) {
      direction = width 
    } else if (direction === width) {
      if (leftEdge) direction = 1
      else direction = -1
    } 

    // We remove all invaders from their current position
    // We offset all InvaderPos by one
    // We read all invaders

    alienInvaderPos.forEach(gridIdx =>
      removeInvaderClass(gridElements[gridIdx])
    )

    // move invaders one square
    for (let i = 0; i <= alienInvaderPos.length - 1; i++){
      alienInvaderPos[i] += direction
    }

    alienInvaderPos
      .filter((_, i) => !deadInvaderIdxs.includes(i))
      .forEach(gridIdx => addInvaderClass(gridElements[gridIdx]))

    //////gameover////

    const shooterCell = getShooterCell();
    // If shooter overlaps with invader, game over
    if (isCellInvader(shooterCell)) {
      resultDisplay.textContent = 'Game Over'
      shooterCell.classList.add('boom')
      gameover = true
      clearInterval(invadeId)
    }


    for (let i = 0; i <= alienInvaderPos.length - 1; i++){
      if (alienInvaderPos[i] > (gridElements.length - (width - 1))) {
        resultDisplay.textContent = 'Game Over'
        gameover = true
        clearInterval(invadeId)
      }
    }
    //////the win//////
    if (deadInvaderIdxs.length === alienInvaderPos.length) {
      resultDisplay.textContent = 'Your a winner baby!'
      gameover = true
      clearInterval(invadeId)
    }
  }

  invadeId = setInterval(moveInvaders, 250)

  /////shoot//////
  function shooting(e) {
    if (gameover) return;

    let bulletId
    let bulletIndex = shooterIndex

    function shootMove() {
      let bulletCell = gridElements[bulletIndex];
      removeClass(bulletCell, 'bullet')
      bulletIndex -= width
      bulletCell = gridElements[bulletIndex];
      addClass(bulletCell, 'bullet');
      
      if (isCellInvader(bulletCell)) {
        removeClass(bulletCell, 'bullet', 'invader')
        addClass(bulletCell, 'boom');

        setTimeout(() => removeClass(gridElements[bulletIndex], 'boom'), 250)
        clearInterval(bulletId)

        const invaderOffIdx = alienInvaderPos.indexOf(bulletIndex)
        deadInvaderIdxs.push(invaderOffIdx)
        result++
        resultDisplay.textContent = result
      }

      if (bulletIndex < width) {
        clearInterval(bulletId)
        setTimeout(() => removeClass(gridElements[bulletIndex], 'bullet'), 100)
      }
    }

    if (e.code === 'Space')
      bulletId = setInterval(shootMove, 100)
  }

  document.addEventListener('keyup', shooting)

  function getShooterCell() {
    const cell = gridElements[shooterIndex]
    if (!cell) {
      console.error('Shooter not found')
      return;
    }
    return cell;
  }

  function cellIs(cell, className) {
    return cell.classList.contains(className);
  }

  function isCellInvader(cell) {
    return cellIs(cell, 'invader')
  }

  function removeClass(cell, ...classes) {
    cell.classList.remove(...classes);
  }

  function removeInvaderClass(cell) {
    removeClass(cell, 'invader');
  }

  function addClass(cell, ...classes) {
    cell.classList.add(...classes);
  }

  function addInvaderClass(cell) {
    addClass(cell, 'invader');
  }
})



