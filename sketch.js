// 內建題庫 CSV
const defaultCSV = `題目,選項A,選項B,選項C,選項D,正確答案
中國共產黨成立於哪一年?,1919年,1921年,1927年,1949年,1921年
中國共產黨第一次全國代表大會在哪裡召開?,北京,上海,廣州,延安,上海
誰是中國共產黨的主要創始人之一?,孫中山,毛澤東,陳獨秀,蔣介石,陳獨秀
長征開始於哪一年?,1927年,1934年,1937年,1945年,1934年
遵義會議召開於哪一年?,1927年,1935年,1945年,1949年,1935年
中華人民共和國成立於哪一年?,1945年,1947年,1949年,1950年,1949年
抗日戰爭全面爆發於哪一年?,1931年,1937年,1941年,1945年,1937年
第一次國共合作開始於哪一年?,1921年,1924年,1927年,1937年,1924年
南昌起義發生於哪一年?,1925年,1927年,1935年,1949年,1927年
井岡山革命根據地建立於哪一年?,1927年,1934年,1937年,1949年,1927年
延安整風運動開始於哪一年?,1935年,1942年,1945年,1949年,1942年
中共七大召開於哪一年?,1935年,1942年,1945年,1949年,1945年
三大戰役不包括以下哪一個?,遼瀋戰役,淮海戰役,平津戰役,渡江戰役,渡江戰役
改革開放開始於哪一年?,1949年,1966年,1976年,1978年,1978年
中共十一屆三中全會召開於哪一年?,1976年,1978年,1980年,1982年,1978年
誰提出了「實踐是檢驗真理的唯一標準」?,鄧小平,胡耀邦,胡喬木,光明日報,光明日報
經濟特區最早設立於哪一年?,1978年,1980年,1984年,1992年,1980年
香港回歸祖國是在哪一年?,1995年,1997年,1999年,2000年,1997年
澳門回歸祖國是在哪一年?,1997年,1998年,1999年,2000年,1999年
中共十八大召開於哪一年?,2010年,2012年,2014年,2016年,2012年`;

// 全域變數
let quizData = [];
let currentQuestion = 0;
let score = 0;
let selectedAnswer = null;
let particles = [];
let p5Canvas;

// 畫面元素
const screens = {
    upload: document.getElementById('uploadScreen'),
    quiz: document.getElementById('quizScreen'),
    result: document.getElementById('resultScreen')
};

// 按鈕元素
const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const startBtn = document.getElementById('startBtn');
const submitBtn = document.getElementById('submitBtn');
const nextBtn = document.getElementById('nextBtn');
const restartBtn = document.getElementById('restartBtn');

// 載入內建題庫
window.addEventListener('DOMContentLoaded', function() {
    parseCSV(defaultCSV);
});

// 事件監聽
fileInput.addEventListener('change', handleFileUpload);
uploadArea.addEventListener('click', function() { 
    fileInput.click(); 
});
startBtn.addEventListener('click', startQuiz);
submitBtn.addEventListener('click', submitAnswer);
nextBtn.addEventListener('click', nextQuestion);
restartBtn.addEventListener('click', restart);

// 拖曳上傳
uploadArea.addEventListener('dragover', function(e) {
    e.preventDefault();
    uploadArea.style.background = '#f0f3ff';
});

uploadArea.addEventListener('dragleave', function() {
    uploadArea.style.background = '';
});

uploadArea.addEventListener('drop', function(e) {
    e.preventDefault();
    uploadArea.style.background = '';
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
        handleFile(file);
    }
});

// 處理檔案上傳
function handleFileUpload(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function handleFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        parseCSV(text);
    };
    reader.readAsText(file);
}

// 解析 CSV
function parseCSV(text) {
    const lines = text.split('\n').filter(function(line) { 
        return line.trim(); 
    });
    const headers = lines[0].split(',').map(function(h) { 
        return h.trim(); 
    });
    
    quizData = lines.slice(1).map(function(line) {
        const values = line.split(',').map(function(v) { 
            return v.trim(); 
        });
        const obj = {};
        headers.forEach(function(header, index) {
            obj[header] = values[index];
        });
        return obj;
    });

    document.getElementById('questionCount').textContent = quizData.length;
    document.getElementById('fileInfo').classList.remove('hidden');
    document.getElementById('totalQ').textContent = quizData.length;
}

// 切換畫面
function showScreen(screenName) {
    Object.values(screens).forEach(function(screen) { 
        screen.classList.remove('active'); 
    });
    screens[screenName].classList.add('active');
}

// 開始測驗
function startQuiz() {
    currentQuestion = 0;
    score = 0;
    selectedAnswer = null;
    showScreen('quiz');
    initP5();
    displayQuestion();
}

// 初始化 P5.js
function initP5() {
    new p5(function(p) {
        p.setup = function() {
            const canvas = p.createCanvas(document.getElementById('p5Canvas').offsetWidth, 300);
            canvas.parent('p5Canvas');
            
            particles = [];
            const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
            for (let i = 0; i < 50; i++) {
                particles.push({
                    x: p.random(p.width),
                    y: p.random(p.height),
                    vx: p.random(-1, 1),
                    vy: p.random(-1, 1),
                    size: p.random(3, 8),
                    color: colors[Math.floor(p.random(colors.length))]
                });
            }
        };

        p.draw = function() {
            p.background(20, 20, 40, 25);
            
            for (let i = 0; i < particles.length; i++) {
                const particle = particles[i];
                particle.x += particle.vx;
                particle.y += particle.vy;

                if (particle.x < 0 || particle.x > p.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > p.height) particle.vy *= -1;

                p.noStroke();
                p.fill(particle.color);
                p.circle(particle.x, particle.y, particle.size);
                
                for (let j = 0; j < particles.length; j++) {
                    if (i !== j) {
                        const other = particles[j];
                        let d = p.dist(particle.x, particle.y, other.x, other.y);
                        if (d < 100) {
                            p.stroke(particle.color + '40');
                            p.strokeWeight(1);
                            p.line(particle.x, particle.y, other.x, other.y);
                        }
                    }
                }
            }
        };

        p.windowResized = function() {
            p.resizeCanvas(document.getElementById('p5Canvas').offsetWidth, 300);
        };
    });
}

// 顯示題目
function displayQuestion() {
    const q = quizData[currentQuestion];
    document.getElementById('currentQ').textContent = currentQuestion + 1;
    document.getElementById('questionText').textContent = q['題目'];
    document.getElementById('score').textContent = score;
    
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';
    
    const opts = ['A', 'B', 'C', 'D'];
    for (let i = 0; i < opts.length; i++) {
        const opt = opts[i];
        const optionKey = '選項' + opt;
        const optionValue = q[optionKey];
        
        if (optionValue) {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerHTML = '<span class="option-label">' + opt + '.</span>' +
                            '<span>' + optionValue + '</span>' +
                            '<span class="option-icon"></span>';
            btn.onclick = function() {
                selectAnswer(btn, optionValue);
            };
            optionsContainer.appendChild(btn);
        }
    }
    
    selectedAnswer = null;
    submitBtn.disabled = true;
    submitBtn.classList.remove('hidden');
    nextBtn.classList.add('hidden');
}

// 選擇答案
function selectAnswer(btn, answer) {
    const allBtns = document.querySelectorAll('.option-btn');
    for (let i = 0; i < allBtns.length; i++) {
        allBtns[i].classList.remove('selected');
    }
    btn.classList.add('selected');
    selectedAnswer = answer;
    submitBtn.disabled = false;
}

// 提交答案
function submitAnswer() {
    const q = quizData[currentQuestion];
    const correctAnswer = q['正確答案'];
    const isCorrect = selectedAnswer === correctAnswer;
    
    if (isCorrect) {
        score++;
        document.getElementById('score').textContent = score;
    }
    
    const allBtns = document.querySelectorAll('.option-btn');
    for (let i = 0; i < allBtns.length; i++) {
        const btn = allBtns[i];
        btn.classList.add('disabled');
        const btnText = btn.querySelector('span:nth-child(2)').textContent;
        const iconSpan = btn.querySelector('.option-icon');
        
        if (btnText === correctAnswer) {
            btn.classList.add('correct');
            iconSpan.textContent = '✓';
        } else if (btnText === selectedAnswer && !isCorrect) {
            btn.classList.add('wrong');
            iconSpan.textContent = '✗';
        }
    }
    
    submitBtn.classList.add('hidden');
    nextBtn.classList.remove('hidden');
}

// 下一題
function nextQuestion() {
    currentQuestion++;
    
    if (currentQuestion < quizData.length) {
        displayQuestion();
    } else {
        showResults();
    }
}

// 顯示結果
function showResults() {
    showScreen('result');
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalTotal').textContent = quizData.length;
    const accuracy = Math.round((score / quizData.length) * 100);
    document.getElementById('accuracy').textContent = accuracy;
}

// 重新開始
function restart() {
    currentQuestion = 0;
    score = 0;
    selectedAnswer = null;
    particles = [];
    
    // 重新載入內建題庫
    parseCSV(defaultCSV);
    
    fileInput.value = '';
    showScreen('upload');
}