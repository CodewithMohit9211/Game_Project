// ========== DOM ELEMENTS ==========
const boardElement = document.getElementById('chessboard');
const turnText = document.getElementById('current-turn');
const checkWarning = document.getElementById('check-warning');
const whiteCap = document.getElementById('white-captured');
const blackCap = document.getElementById('black-captured');
const pWhite = document.getElementById('player-white');
const pBlack = document.getElementById('player-black');
const restartBtn = document.getElementById('restart-btn');
const promotionModal = document.getElementById('promotion-modal');

// reference the static side‑selection overlay defined in the HTML
const sideSelect = document.getElementById('side-select');

let board = [];
let turn = 'w';
let selectedSquare = null;
let validMoves = [];
let pendingPromotion = null;
let playerColor = 'w'; // default

// ========== PIECE ICONS ==========
const pieceMap = {
    'wK': '♚', 'wQ': '♛', 'wR': '♜', 'wB': '♝', 'wN': '♞', 'wP': '♟',
    'bK': '♚', 'bQ': '♛', 'bR': '♜', 'bB': '♝', 'bN': '♞', 'bP': '♟'
};

// ========== INIT BOARD ==========
function initBoard() {
    board = [
        ['bR','bN','bB','bQ','bK','bB','bN','bR'],
        ['bP','bP','bP','bP','bP','bP','bP','bP'],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['wP','wP','wP','wP','wP','wP','wP','wP'],
        ['wR','wN','wB','wQ','wK','wB','wN','wR']
    ];
    whiteCap.innerHTML = '';
    blackCap.innerHTML = '';
    // start the turn according to the chosen player color (defaults to 'w')
    turn = playerColor || 'w';
    selectedSquare = null;
    validMoves = [];
    pendingPromotion = null;
    updateUI();
    renderBoard();
}

// ========== RENDER BOARD ==========
function renderBoard() {
    boardElement.innerHTML = '';
    for(let r=0; r<8; r++) {
        for(let c=0; c<8; c++) {
            const square = document.createElement('div');
            square.className = `square ${(r+c)%2===0?'light':'dark'}`;

            if(board[r][c]) {
                square.textContent = pieceMap[board[r][c]];
                square.style.color = board[r][c].startsWith('w') ? 'white' : 'black';
            }

            if(selectedSquare?.r===r && selectedSquare?.c===c) square.classList.add('selected');
            if(validMoves.some(m=>m.r===r && m.c===c)) square.classList.add('valid-dest');

            square.onclick = () => handleSquareClick(r,c);
            boardElement.appendChild(square);
        }
    }
}

// ========== HANDLE SQUARE CLICK ==========
function handleSquareClick(r,c) {
    const piece = board[r][c];

    if(piece && piece.startsWith(turn)) {
        selectedSquare = {r,c};
        validMoves = getFilteredMoves(r,c,board);
        renderBoard();
        return;
    }

    const move = validMoves.find(m=>m.r===r && m.c===c);
    if(move) executeMove(selectedSquare.r, selectedSquare.c, r, c);
    else {
        selectedSquare = null;
        validMoves = [];
        renderBoard();
    }
}

// ========== EXECUTE MOVE ==========
function executeMove(fromR, fromC, toR, toC) {
    const piece = board[fromR][fromC];
    const target = board[toR][toC];

    if(target) {
        const icon = document.createElement('span');
        icon.textContent = pieceMap[target];
        (turn==='w'?whiteCap:blackCap).appendChild(icon);
    }

    board[toR][toC] = piece;
    board[fromR][fromC] = '';

    // Pawn Promotion
    if(piece.endsWith('P') && (toR===0 || toR===7)) {
        pendingPromotion = {r: toR, c: toC, color: turn};
        promotionModal.style.display = 'flex';
        return;
    }

    finishTurn();
}

// ========== FINISH TURN ==========
function finishTurn() {
    turn = turn==='w'?'b':'w';
    updateUI();

    if(isKingInCheck(turn,board)) {
        checkWarning.style.display = 'block';
        if(isCheckmate(turn)) {
            alert(`GAME OVER: ${turn==='w'?'Black':'White'} wins!`);
        }
    } else checkWarning.style.display = 'none';

    selectedSquare = null;
    validMoves = [];
    renderBoard();
}

// ========== UPDATE UI ==========
function updateUI() {
    turnText.textContent = turn==='w'?'White':'Black';
    pWhite.classList.toggle('active', turn==='w');
    pBlack.classList.toggle('active', turn==='b');
}

// ========== RAW AND FILTERED MOVES ==========
function getRawMoves(r,c,boardArr) {
    const moves = [];
    const piece = boardArr[r][c];
    if(!piece) return [];
    const type = piece[1], color = piece[0];

    const directions = {
        'R': [[0,1],[0,-1],[1,0],[-1,0]],
        'B': [[1,1],[1,-1],[-1,1],[-1,-1]],
        'Q': [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]],
        'N': [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]],
        'K': [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]]
    };

    if(type==='P') {
        const dir = color==='w'?-1:1;
        if(boardArr[r+dir]?.[c]==='') {
            moves.push({r:r+dir,c});
            const startRow = color==='w'?6:1;
            if(r===startRow && boardArr[r+2*dir][c]==='') moves.push({r:r+2*dir,c});
        }
        for(let dc of [-1,1]){
            let target = boardArr[r+dir]?.[c+dc];
            if(target && !target.startsWith(color)) moves.push({r:r+dir,c:c+dc});
        }
    } else if(directions[type]) {
        for(let [dr,dc] of directions[type]){
            let nr = r+dr, nc=c+dc;
            while(nr>=0 && nr<8 && nc>=0 && nc<8){
                const target = boardArr[nr][nc];
                if(!target){
                    moves.push({r:nr,c:nc});
                    if(type==='N'||type==='K') break;
                } else {
                    if(!target.startsWith(color)) moves.push({r:nr,c:nc});
                    break;
                }
                nr+=dr; nc+=dc;
            }
        }
    }
    return moves;
}

function getFilteredMoves(r,c,boardArr){
    const raw = getRawMoves(r,c,boardArr);
    const color = boardArr[r][c][0];
    return raw.filter(m=>{
        const temp = boardArr.map(row=>[...row]);
        temp[m.r][m.c] = temp[r][c];
        temp[r][c]='';
        return !isKingInCheck(color,temp);
    });
}

// ========== CHECK / CHECKMATE ==========
function isKingInCheck(color,boardArr){
    let kingPos=null;
    for(let r=0;r<8;r++){
        for(let c=0;c<8;c++){
            if(boardArr[r][c]===color+'K') kingPos={r,c};
        }
    }
    const opponent = color==='w'?'b':'w';
    for(let r=0;r<8;r++){
        for(let c=0;c<8;c++){
            if(boardArr[r][c]?.startsWith(opponent)){
                if(getRawMoves(r,c,boardArr).some(m=>m.r===kingPos.r && m.c===kingPos.c)) return true;
            }
        }
    }
    return false;
}

function isCheckmate(color){
    for(let r=0;r<8;r++){
        for(let c=0;c<8;c++){
            if(board[r][c]?.startsWith(color)){
                if(getFilteredMoves(r,c,board).length>0) return false;
            }
        }
    }
    return true;
}

// ========== PAWN PROMOTION ==========
function selectPromotion(type){
    const {r,c,color} = pendingPromotion;
    board[r][c] = color + type;
    pendingPromotion = null;
    promotionModal.style.display = 'none';
    finishTurn();
}

// ========== RESTART BUTTON ==========
restartBtn.onclick = ()=> initBoard();

// ========== SIDE SELECTION ==========
function chooseSide(color) {
    playerColor = color;
    if (sideSelect) sideSelect.style.display = 'none';
    initBoard();
}

// If you prefer to attach listeners rather than using inline attributes, uncomment below
// document.getElementById('choose-white')?.addEventListener('click', () => chooseSide('w'));
// document.getElementById('choose-black')?.addEventListener('click', () => chooseSide('b'));

// INIT BOARD AFTER SELECTION
initBoard();