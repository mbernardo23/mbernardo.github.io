// Estado global do aplicativo
const appState = {
    timer: {
        seconds: 0,
        interval: null,
        running: false
    },
    teams: {
        A: { name: '', score: 0 },
        B: { name: '', score: 0 }
    },
    history: []
};

// Inicialização
function init() {
    loadHistory();
}

// Controle do Cronômetro
function controlTimer(action) {
    switch(action) {
        case 'start':
            if (!appState.timer.running) {
                appState.timer.interval = setInterval(() => {
                    appState.timer.seconds++;
                    updateTimerDisplay();
                }, 1000);
                appState.timer.running = true;
            }
            break;
        case 'pause':
            clearInterval(appState.timer.interval);
            appState.timer.running = false;
            break;
        case 'reset':
            clearInterval(appState.timer.interval);
            appState.timer = { seconds: 0, interval: null, running: false };
            updateTimerDisplay();
            break;
    }
}

function updateTimerDisplay() {
    const hours = Math.floor(appState.timer.seconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((appState.timer.seconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (appState.timer.seconds % 60).toString().padStart(2, '0');
    document.getElementById('timerDisplay').textContent = `${hours}:${minutes}:${seconds}`;
}

// Controle do Placar
function modifyPoint(team, operation) {
    if (operation === 'add') {
        appState.teams[team].score++;
    } else if (operation === 'remove' && appState.teams[team].score > 0) {
        appState.teams[team].score--;
    }
    updateScores();
}

function updateScores() {
    document.getElementById('scoreA').textContent = appState.teams.A.score;
    document.getElementById('scoreB').textContent = appState.teams.B.score;
}

// Zerar Jogo
function resetGame() {
    if (confirm('Deseja zerar o placar e o cronômetro?')) {
        appState.teams.A.score = 0;
        appState.teams.B.score = 0;
        appState.teams.A.name = document.getElementById('teamAName').value || 'Time A';
        appState.teams.B.name = document.getElementById('teamBName').value || 'Time B';
        
        updateScores();
        controlTimer('reset');
    }
}

// Gerenciamento do Histórico
function saveGame() {
    const gameData = {
        date: new Date().toLocaleString(),
        duration: formatTime(appState.timer.seconds),
        teams: {
            A: { ...appState.teams.A },
            B: { ...appState.teams.B }
        }
    };
    
    appState.history.push(gameData);
    localStorage.setItem('volleyballHistory', JSON.stringify(appState.history));
    alert('Jogo salvo com sucesso!');
    loadHistory();
}

function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

function loadHistory() {
    const saved = localStorage.getItem('volleyballHistory');
    appState.history = saved ? JSON.parse(saved) : [];
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = appState.history.length > 0
        ? appState.history.slice().reverse().map(game => `
            <li>
                <strong>${game.date}</strong> (${game.duration})<br>
                ${game.teams.A.name}: ${game.teams.A.score} x ${game.teams.B.score} ${game.teams.B.name}
            </li>
        `).join('')
        : '<li>Nenhuma partida registrada</li>';
}

function showHistory() {
    document.getElementById('historyPanel').style.display = 'block';
}

function hideHistory() {
    document.getElementById('historyPanel').style.display = 'none';
}

function clearHistory() {
    if (confirm('Deseja realmente limpar todo o histórico?')) {
        localStorage.removeItem('volleyballHistory');
        appState.history = [];
        updateHistoryDisplay();
    }
}

// Exportação de Dados
function exportData(format) {
    if (appState.history.length === 0) {
        alert('Nenhum dado disponível para exportação');
        return;
    }

    if (format === 'json') {
        const data = JSON.stringify(appState.history, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        downloadFile(blob, 'historico-volei.json');
    } else if (format === 'excel') {
        const ws = XLSX.utils.json_to_sheet(appState.history.map(game => ({
            'Data': game.date,
            'Duração': game.duration,
            'Time A': game.teams.A.name,
            'Pontos A': game.teams.A.score,
            'Time B': game.teams.B.name,
            'Pontos B': game.teams.B.score
        })));
        
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Histórico');
        XLSX.writeFile(wb, `historico-volei-${new Date().toISOString().split('T')[0]}.xlsx`);
    }
}

function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
}

// Inicializa o aplicativo
window.onload = init;

// Função para salvar o jogo e zerar o placar
function saveGame() {

    
    // Obter os nomes dos times antes de zerar
    const teamAName = document.getElementById('teamAName').value || 'Time A';
    const teamBName = document.getElementById('teamBName').value || 'Time B';
    
    const gameData = {
        date: new Date().toLocaleString(),
        duration: formatTime(appState.timer.seconds),
        teams: {
            A: { 
                name: teamAName,
                score: appState.teams.A.score 
            },
            B: { 
                name: teamBName,
                score: appState.teams.B.score 
            }
        }
    };
    
    // Salva no histórico
    appState.history.push(gameData);
    localStorage.setItem('volleyballHistory', JSON.stringify(appState.history));
    
    // Zera o placar (mas mantém os nomes dos times)
    appState.teams.A.score = 0;
    appState.teams.B.score = 0;
    updateScores();
    
    // Atualiza o histórico
    updateHistoryDisplay();
    
    // Feedback para o usuário
    alert('Jogo salvo e placar zerado com sucesso!');
    
    // Feedback visual
    const saveBtn = document.getElementById('saveButton');
    saveBtn.classList.add('saving-feedback');
    setTimeout(() => saveBtn.classList.remove('saving-feedback'), 1000);
}

// Função para zerar apenas os pontos (usada no saveGame)
function resetScores() {
    appState.teams.A.score = 0;
    appState.teams.B.score = 0;
    updateScores();
}

