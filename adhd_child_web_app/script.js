// 应用状态管理
class AppState {
    constructor() {
        this.currentScreen = 'welcomeScreen';
        this.currentStars = 0;
        this.dailyProgress = 0;
        this.currentScenario = null;
        this.selectedEmotion = null;
        this.achievements = [];
        this.breathingInterval = null;
        this.completedScenarios = new Set();

        // 本地存储
        this.loadProgress();
    }

    loadProgress() {
        const saved = localStorage.getItem('bojie_app_progress');
        if (saved) {
            const data = JSON.parse(saved);
            this.currentStars = data.stars || 0;
            this.dailyProgress = data.dailyProgress || 0;
            this.achievements = data.achievements || [];
            this.completedScenarios = new Set(data.completedScenarios || []);

            // 检查是否是新的一天
            const today = new Date().toDateString();
            if (data.lastDate !== today) {
                this.dailyProgress = 0;
                this.saveProgress();
            }
        }
    }

    saveProgress() {
        const data = {
            stars: this.currentStars,
            dailyProgress: this.dailyProgress,
            achievements: this.achievements,
            completedScenarios: Array.from(this.completedScenarios),
            lastDate: new Date().toDateString()
        };
        localStorage.setItem('bojie_app_progress', JSON.stringify(data));
    }

    addStars(amount) {
        this.currentStars += amount;
        this.updateStarDisplay();
        this.saveProgress();
    }

    updateDailyProgress(amount) {
        this.dailyProgress = Math.min(100, this.dailyProgress + amount);
        this.updateProgressDisplay();
        this.saveProgress();

        if (this.dailyProgress >= 100) {
            this.showDailyComplete();
        }
    }

    updateStarDisplay() {
        document.querySelector('.star-count').textContent = this.currentStars;
    }

    updateProgressDisplay() {
        const mainProgress = document.getElementById('mainProgress');
        const dailyProgress = document.getElementById('dailyProgress');
        const progressPercent = document.getElementById('progressPercent');

        if (mainProgress) mainProgress.style.width = `${this.dailyProgress}%`;
        if (dailyProgress) dailyProgress.style.width = `${this.dailyProgress}%`;
        if (progressPercent) progressPercent.textContent = `${this.dailyProgress}%`;
    }

    showDailyComplete() {
        this.addStars(5);
        this.showCompletionMessage();
    }

    showCompletionMessage() {
        // 创建完成提示元素
        const messageDiv = document.createElement('div');
        messageDiv.className = 'completion-message';
        messageDiv.innerHTML = `
            <div class="completion-content">
                <div class="completion-icon">🎉</div>
                <h3>太棒了！</h3>
                <p>你完成了今天的所有训练，获得5颗星星！</p>
                <div class="completion-stars">⭐⭐⭐⭐⭐</div>
                <button onclick="this.parentElement.parentElement.remove()">继续加油</button>
            </div>
        `;

        document.body.appendChild(messageDiv);

        // 2.5秒后自动消失
        setTimeout(() => {
            if (messageDiv.parentElement) {
                messageDiv.style.animation = 'slideInRight 0.3s ease reverse';
                setTimeout(() => {
                    if (messageDiv.parentElement) {
                        messageDiv.remove();
                    }
                }, 300);
            }
        }, 2500);
    }
}

// 情景数据定义
const scenarios = {
    waterCup: {
        title: '水杯被打翻了',
        icon: '💧',
        description: '课间休息时，你的水杯被同学不小心碰到摔在地上。同学一开始说不是他弄的，你很生气...',
        emotion: 'angry',
        choices: [
            {
                text: '勒住同学的脖子，控制他',
                feedback: '这样做会让同学受伤，也会让自己陷入更大的麻烦。暴力解决问题不是好办法。',
                stars: 0,
                correct: false
            },
            {
                text: '去找老师说明情况',
                feedback: '很好！找老师帮助是最正确的选择。老师会公正处理，也能保护大家的安全。',
                stars: 3,
                correct: true
            },
            {
                text: '冷静地告诉同学：我知道你可能不是故意的，但水杯坏了，我们需要解决这个问题。',
                feedback: '太棒了！你既控制了情绪，又理性地表达了想法。这是非常成熟的做法！',
                stars: 5,
                correct: true
            }
        ]
    },
    exclude: {
        title: '朋友不和我玩',
        icon: '😔',
        description: '你听到同学喊江承彦一起去上厕所，但没有喊你，你感到很生气和被排除...',
        emotion: 'angry',
        choices: [
            {
                text: '拉扯同学的衣服，不让他们走',
                feedback: '这样做会让同学们更不想和你玩，还可能伤害到别人。',
                stars: 0,
                correct: false
            },
            {
                text: '深呼吸，然后问：我可以和你们一起去吗？',
                feedback: '很好！你控制住了冲动，用礼貌的方式表达了自己的想法。',
                stars: 3,
                correct: true
            },
            {
                text: '先让自己冷静下来，然后找老师聊聊天，或者自己先做点别的事情',
                feedback: '太棒了！你学会了自我调节，也懂得寻求其他方式来处理情绪。',
                stars: 4,
                correct: true
            }
        ]
    },
    boring: {
        title: '上课好无聊',
        icon: '😴',
        description: '老师在讲课，但你觉得很无聊，注意力不集中，想要做点别的事情...',
        emotion: 'bored',
        choices: [
            {
                text: '做自己喜欢的事情，不听老师讲课',
                feedback: '这样会影响学习，老师也会担心你。我们可以想更好的办法。',
                stars: 1,
                correct: false
            },
            {
                text: '努力找老师讲课的有趣之处，主动回答问题',
                feedback: '很好！主动参与课堂会让学习变得更有趣。',
                stars: 4,
                correct: true
            },
            {
                text: '在心里制定一个学习小目标，比如这节课要学会一个知识点',
                feedback: '太棒了！你把无聊转化为了学习动力，这是很棒的成长！',
                stars: 5,
                correct: true
            }
        ]
    },
    ballGame: {
        title: '踢球冲突',
        icon: '⚽',
        description: '体育课上，看到其他同学在踢球，你也想加入...',
        emotion: 'excited',
        choices: [
            {
                text: '直接走过去踢走他们的球',
                feedback: '这样做会打断别人的游戏，让其他同学不开心。',
                stars: 0,
                correct: false
            },
            {
                text: '用球追着同学打，因为觉得无聊',
                feedback: '这样会伤害到同学，也会让自己陷入麻烦。我们需要用更好的方式。',
                stars: 0,
                correct: false
            },
            {
                text: '友好地问：我可以和你们一起踢球吗？',
                feedback: '太棒了！你用礼貌的方式表达了想加入的愿望，同学们会很欢迎你的。',
                stars: 5,
                correct: true
            },
            {
                text: '先在旁边观看，找到合适的时机问：你们还需要人吗？',
                feedback: '很好！你学会了观察和等待，这是很棒的社交技能！',
                stars: 4,
                correct: true
            }
        ]
    }
};

// 全局变量
const appState = new AppState();

// 页面切换功能
function showScreen(screenId) {
    // 隐藏所有页面
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    // 显示目标页面
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        setTimeout(() => {
            targetScreen.classList.add('active');
        }, 100);
    }

    appState.currentScreen = screenId;
}

// 开始每日训练
function startDailyTraining() {
    showScreen('dailyTrainingScreen');
}

// 开始训练模块
function startModule(moduleType) {
    switch(moduleType) {
        case 'attention':
            showScreen('attentionTrainingScreen');
            break;
        case 'emotion':
            showScreen('scenarioScreen');
            break;
        case 'social':
            showScreen('socialTrainingScreen');
            break;
    }
}

// 开始情景模拟
function startScenario(scenarioId) {
    const scenario = scenarios[scenarioId];
    if (!scenario) return;

    appState.currentScenario = scenarioId;

    // 更新页面内容
    document.getElementById('scenarioTitle').textContent = scenario.title;
    document.getElementById('sceneIllustration').innerHTML = `<div style="font-size: 4rem;">${scenario.icon}</div>`;
    document.getElementById('sceneDescription').textContent = scenario.description;

    // 生成选择按钮
    const choiceButtons = document.getElementById('choiceButtons');
    choiceButtons.innerHTML = '';

    scenario.choices.forEach((choice, index) => {
        const button = document.createElement('button');
        button.className = 'choice-btn';
        button.textContent = choice.text;
        button.onclick = () => makeChoice(index);
        choiceButtons.appendChild(button);
    });

    // 重置反馈区域
    document.getElementById('feedbackArea').style.display = 'none';

    // 设置默认情绪选择
    selectEmotion(scenario.emotion === 'bored' ? 'calm' : scenario.emotion);

    showScreen('scenarioInteractionScreen');
}

// 情绪选择
function selectEmotion(emotion) {
    appState.selectedEmotion = emotion;

    // 更新按钮状态
    document.querySelectorAll('.emotion-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    event.target.classList.add('selected');
}

// 做出选择
function makeChoice(choiceIndex) {
    const scenario = scenarios[appState.currentScenario];
    if (!scenario || !scenario.choices[choiceIndex]) return;

    const choice = scenario.choices[choiceIndex];

    // 显示反馈
    document.getElementById('feedbackTitle').textContent = choice.correct ? '做得好！' : '让我们想想其他办法';
    document.getElementById('feedbackText').textContent = choice.feedback;

    // 更新星星数量
    if (choice.stars > 0) {
        const feedbackStar = document.querySelector('.feedback-star');
        feedbackStar.innerHTML = '⭐'.repeat(choice.stars);
        feedbackStar.style.display = 'block';
    } else {
        document.querySelector('.feedback-star').style.display = 'none';
    }

    // 显示反馈区域
    document.getElementById('feedbackArea').style.display = 'block';

    // 添加星星和进度
    appState.addStars(choice.stars);
    appState.updateDailyProgress(choice.stars * 10);

    // 记录完成的情景
    appState.completedScenarios.add(appState.currentScenario);

    // 添加成就
    if (choice.correct) {
        appState.achievements.push(`完成了"${scenario.title}"的正确选择`);
    }

    // 滚动到反馈区域
    document.getElementById('feedbackArea').scrollIntoView({ behavior: 'smooth' });
}

// 下一个情景
function nextScenario() {
    showScreen('scenarioScreen');
}

// 深呼吸练习
function startBreathing() {
    const circle = document.getElementById('breathingCircle');
    const text = document.getElementById('breathingText');

    // 显示开始提示
    showInlineMessage('深呼吸练习开始！我们将完成5轮呼吸，每轮12秒', 'info');

    let phase = 0; // 0: 准备, 1: 吸气, 2: 保持, 3: 呼气
    let count = 0;
    let currentPhaseCount = 0;
    const phaseDuration = 4; // 每个阶段4秒
    const totalRounds = 5;

    appState.breathingInterval = setInterval(() => {
        // 计算当前轮次
        const currentRound = Math.floor(count / 3) + 1; // 每3个阶段为一轮

        // 每4秒切换一次阶段
        currentPhaseCount++;

        if (currentPhaseCount >= phaseDuration) {
            phase = (phase + 1) % 4;
            currentPhaseCount = 0;
            count++;

            // 切换到新阶段时的初始文本
            switch(phase) {
                case 1: // 吸气
                    circle.className = 'breathing-circle inhale';
                    break;
                case 2: // 保持
                    circle.className = 'breathing-circle';
                    break;
                case 3: // 呼气
                    circle.className = 'breathing-circle exhale';
                    break;
                case 0: // 休息
                    circle.className = 'breathing-circle';
                    break;
            }
        }

        // 在每个阶段内显示倒计时和轮次信息
        const remainingTime = phaseDuration - currentPhaseCount;
        let phaseText = '';

        if (phase === 0 && count > 0) {
            // 只有轮次间的休息才显示轮次信息
            const nextRound = Math.min(currentRound + 1, totalRounds);
            if (nextRound <= totalRounds) {
                phaseText = `第${nextRound}轮准备 (${remainingTime}秒)`;
            } else {
                phaseText = `练习完成！`;
            }
        } else {
            switch(phase) {
                case 1:
                    phaseText = `第${currentRound}轮 吸气 (${remainingTime}秒)`;
                    break;
                case 2:
                    phaseText = `第${currentRound}轮 保持 (${remainingTime}秒)`;
                    break;
                case 3:
                    phaseText = `第${currentRound}轮 呼气 (${remainingTime}秒)`;
                    break;
                case 0:
                    phaseText = `休息 (${remainingTime}秒)`;
                    break;
            }
        }
        text.textContent = phaseText;

        // 完成5轮后自动停止 (每轮3个阶段：吸气、保持、呼气，共15个阶段转换)
        if (count >= totalRounds * 3) {
            stopBreathing();
            showInlineMessage('深呼吸练习完成！你做得很好，现在感觉心情平静一些了吗？', 'success');
            appState.addStars(2);
            appState.updateDailyProgress(10);
        }
    }, 1000); // 每秒更新一次倒计时
}

function stopBreathing() {
    if (appState.breathingInterval) {
        clearInterval(appState.breathingInterval);
        appState.breathingInterval = null;
    }

    const circle = document.getElementById('breathingCircle');
    const text = document.getElementById('breathingText');

    circle.className = 'breathing-circle';
    text.textContent = '准备开始';
}

// 分享进步
function shareProgress() {
    const message = `我在情绪小助手应用中已经获得了 ${appState.currentStars} 颗星星！今天完成了 ${appState.dailyProgress}% 的训练目标。继续努力，成为更好的自己！`;

    if (navigator.share) {
        navigator.share({
            title: '宝宝的情绪训练进步',
            text: message
        });
    } else {
        showInlineMessage(message, 'info');
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化显示
    appState.updateStarDisplay();
    appState.updateProgressDisplay();

    // 显示欢迎页面
    showScreen('welcomeScreen');

    // 添加键盘导航支持
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            showScreen('welcomeScreen');
        }
    });

    // 页面卸载时保存进度
    window.addEventListener('beforeunload', function() {
        appState.saveProgress();
    });
});

// 添加触摸优化
if ('ontouchstart' in window) {
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        });

        button.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

// 音效支持（可选）
function playSound(type) {
    // 创建简单的音效
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch(type) {
        case 'success':
            oscillator.frequency.value = 523.25; // C5
            gainNode.gain.value = 0.3;
            break;
        case 'button':
            oscillator.frequency.value = 440; // A4
            gainNode.gain.value = 0.1;
            break;
        case 'complete':
            oscillator.frequency.value = 659.25; // E5
            gainNode.gain.value = 0.3;
            break;
    }

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
}

// 内联消息显示函数
function showInlineMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `inline-message inline-message-${type}`;

    let icon = '';
    switch(type) {
        case 'success':
            icon = '✅';
            break;
        case 'info':
            icon = 'ℹ️';
            break;
        case 'warning':
            icon = '⚠️';
            break;
        default:
            icon = '📢';
    }

    messageDiv.innerHTML = `
        <div class="inline-message-content">
            <span class="message-icon">${icon}</span>
            <span class="message-text">${message}</span>
        </div>
    `;

    // 添加到页面顶部
    document.body.appendChild(messageDiv);

    // 2.5秒后自动消失
    setTimeout(() => {
        if (messageDiv.parentElement) {
            messageDiv.remove();
        }
    }, 2500);
}

// ================ 注意力训练模块 ================

// 记忆数字游戏
let memoryGameState = {
    currentNumber: '',
    level: 1,
    streak: 0,
    isShowing: false
};

function startMemoryGame() {
    if (memoryGameState.isShowing) return;

    // 生成随机数字
    const length = Math.min(3 + Math.floor(memoryGameState.level / 2), 8);
    memoryGameState.currentNumber = '';
    for (let i = 0; i < length; i++) {
        memoryGameState.currentNumber += Math.floor(Math.random() * 10);
    }

    // 显示数字
    const display = document.getElementById('memoryNumber');
    display.textContent = '记住这个数字：' + memoryGameState.currentNumber;
    memoryGameState.isShowing = true;

    // 3秒后隐藏
    setTimeout(() => {
        display.textContent = '现在输入你记住的数字';
        document.getElementById('memoryInputArea').style.display = 'flex';
        document.getElementById('memoryInput').value = '';
        document.getElementById('memoryInput').focus();
        memoryGameState.isShowing = false;
    }, 3000);
}

function checkMemoryAnswer() {
    const userAnswer = document.getElementById('memoryInput').value.trim();

    if (userAnswer === memoryGameState.currentNumber) {
        // 正确
        showInlineMessage('答对了！数字正确！', 'success');
        memoryGameState.streak++;
        memoryGameState.level++;

        appState.addStars(2);
        appState.updateDailyProgress(5);

        // 更新显示
        document.getElementById('memoryLevel').textContent = memoryGameState.level;
        document.getElementById('memoryStreak').textContent = memoryGameState.streak;

        // 隐藏输入区域
        document.getElementById('memoryInputArea').style.display = 'none';

        // 自动开始下一轮
        setTimeout(() => {
            startMemoryGame();
        }, 2000);

    } else {
        // 错误
        showInlineMessage(`答错了！正确答案是：${memoryGameState.currentNumber}`, 'warning');
        memoryGameState.streak = 0;
        memoryGameState.level = Math.max(1, memoryGameState.level - 1);

        // 更新显示
        document.getElementById('memoryLevel').textContent = memoryGameState.level;
        document.getElementById('memoryStreak').textContent = memoryGameState.streak;

        // 隐藏输入区域
        document.getElementById('memoryInputArea').style.display = 'none';

        // 重新开始
        setTimeout(() => {
            startMemoryGame();
        }, 3000);
    }
}

// 找不同游戏
let differenceGameState = {
    score: 0,
    startTime: 0,
    currentPattern: null,
    differentPosition: null
};

function startDifferenceGame() {
    const gridSize = 9;
    differenceGameState.startTime = Date.now();

    // 创建两个相同的3x3图案
    const pattern1 = new Array(gridSize).fill(false);
    const pattern2 = [...pattern1];

    // 随机选择一个格子作为不同的
    const differentPos = Math.floor(Math.random() * gridSize);
    pattern2[differentPos] = !pattern1[differentPos];

    differenceGameState.currentPattern = pattern1;
    differenceGameState.differentPosition = differentPos;

    // 渲染图案
    renderPattern('pattern1', pattern1);
    renderPattern('pattern2', pattern2);

    // 显示输入区域
    document.getElementById('differenceInputArea').style.display = 'block';
}

function renderPattern(elementId, pattern) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';

    pattern.forEach((isFilled, index) => {
        const cell = document.createElement('div');
        cell.className = 'pattern-cell';
        if (isFilled) {
            cell.classList.add('different');
        }
        cell.onclick = () => checkDifference(index, elementId);
        container.appendChild(cell);
    });
}

function checkDifference(index, patternId) {
    if (patternId !== 'pattern2') {
        showInlineMessage('请点击右边图案中的不同格子', 'warning');
        return;
    }

    if (index === differenceGameState.differentPosition) {
        // 找到了！
        showInlineMessage('太棒了！找到了不同之处！', 'success');
        differenceGameState.score++;

        // 计算用时
        const timeUsed = Math.floor((Date.now() - differenceGameState.startTime) / 1000);

        appState.addStars(3);
        appState.updateDailyProgress(8);

        // 更新显示
        document.getElementById('differenceScore').textContent = differenceGameState.score;
        document.getElementById('differenceTime').textContent = timeUsed + '秒';

        // 标记找到的格子
        const cells = document.querySelectorAll('#pattern2 .pattern-cell');
        cells[index].classList.add('found');

        // 隐藏输入区域
        document.getElementById('differenceInputArea').style.display = 'none';

        // 自动开始下一轮
        setTimeout(() => {
            startDifferenceGame();
        }, 2000);

    } else {
        showInlineMessage('这个格子相同，再仔细看看', 'warning');
    }
}

// ================ 社交技能训练模块 ================

// 轮流说话练习
let turnTakingState = {
    score: 0,
    currentSpeaker: 'friend',
    isListening: false
};

const conversationScenarios = [
    { friend: "我今天过生日！", correctAction: "askQuestion", feedback: "很好的选择！询问细节表示你在关心朋友" },
    { friend: "我昨天看了一部很有趣的电影", correctAction: "askQuestion", feedback: "太棒了！对朋友的话题表示兴趣是很好的社交技能" },
    { friend: "我不小心把水杯打翻了", correctAction: "listenCarefully", feedback: "很好！认真倾听朋友的困扰很重要" },
    { friend: "周末你想去哪里玩？", correctAction: "takeTurn", feedback: "正确！现在是你的说话时间了" }
];

function startTurnTaking() {
    // 随机选择一个情景
    const scenario = conversationScenarios[Math.floor(Math.random() * conversationScenarios.length)];

    // 显示朋友的话
    document.getElementById('friendBubble').textContent = scenario.friend;
    document.getElementById('studentBubble').textContent = '...';

    // 显示操作按钮
    document.getElementById('turnTakingActions').style.display = 'flex';

    // 存储当前情景
    turnTakingState.currentScenario = scenario;
}

function takeTurn() {
    if (turnTakingState.currentScenario.correctAction === 'takeTurn') {
        showInlineMessage('正确！现在轮到你说话了', 'success');
        turnTakingState.score++;
        updateTurnTakingScore();

        document.getElementById('studentBubble').textContent = '谢谢你的分享！我也想说...';
        appState.addStars(2);
        appState.updateDailyProgress(6);
    } else {
        showInlineMessage('现在还不是最好的说话时机，先听听朋友说', 'warning');
    }

    setTimeout(() => {
        document.getElementById('turnTakingActions').style.display = 'none';
    }, 2000);
}

function listenCarefully() {
    if (turnTakingState.currentScenario.correctAction === 'listenCarefully') {
        showInlineMessage('很好！认真倾听是重要的社交技能', 'success');
        turnTakingState.score++;
        updateTurnTakingScore();

        document.getElementById('studentBubble').textContent = '我在认真听你说...';
        appState.addStars(2);
        appState.updateDailyProgress(6);
    } else {
        showInlineMessage('你可以做得更好！试着提出问题或分享自己的想法', 'info');
    }

    setTimeout(() => {
        document.getElementById('turnTakingActions').style.display = 'none';
    }, 2000);
}

function askQuestion() {
    if (turnTakingState.currentScenario.correctAction === 'askQuestion') {
        showInlineMessage('太棒了！提出问题表示你对朋友的话题感兴趣', 'success');
        turnTakingState.score++;
        updateTurnTakingScore();

        document.getElementById('studentBubble').textContent = '真的吗？能告诉我更多吗？';
        appState.addStars(2);
        appState.updateDailyProgress(6);
    } else {
        showInlineMessage('提问是好的，但这个情况下可能需要先倾听', 'info');
    }

    setTimeout(() => {
        document.getElementById('turnTakingActions').style.display = 'none';
    }, 2000);
}

function updateTurnTakingScore() {
    document.getElementById('turnTakingScore').textContent = turnTakingState.score;
}

// 情绪识别练习
let emotionGameState = {
    score: 0,
    currentScenario: null
};

const emotionScenarios = [
    { emotion: 'happy', text: '小明收到了期待已久的生日礼物', character: '😊', intensity: 8 },
    { emotion: 'sad', text: '小红的宠物狗走丢了', character: '😢', intensity: 9 },
    { emotion: 'angry', text: '有人不小心把小华的作业弄湿了', character: '😠', intensity: 7 },
    { emotion: 'scared', text: '小李晚上听到奇怪的声音', character: '😰', intensity: 6 },
    { emotion: 'happy', text: '考试得了100分', character: '😊', intensity: 9 },
    { emotion: 'sad', text: '最好的朋友要搬家了', character: '😢', intensity: 8 },
    { emotion: 'angry', text: '被同学冤枉了', character: '😠', intensity: 9 },
    { emotion: 'scared', text: '要在全班同学面前演讲', character: '😰', intensity: 7 }
];

function startEmotionRecognition() {
    // 随机选择一个情景
    const scenario = emotionScenarios[Math.floor(Math.random() * emotionScenarios.length)];

    emotionGameState.currentScenario = scenario;

    // 显示情景
    document.getElementById('scenarioCharacter').textContent = scenario.character;
    document.getElementById('scenarioText').textContent = scenario.text;
}

function selectEmotionChoice(emotion) {
    if (!emotionGameState.currentScenario) return;

    if (emotion === emotionGameState.currentScenario.emotion) {
        showInlineMessage('正确！你很好地识别了对方的情绪', 'success');
        emotionGameState.score++;

        appState.addStars(2);
        appState.updateDailyProgress(5);

        // 自动开始下一个
        setTimeout(() => {
            startEmotionRecognition();
        }, 2000);

    } else {
        showInlineMessage(`不正确。这个情景下更可能感受到的是${emotionGameState.currentScenario.emotion === 'happy' ? '开心' : emotionGameState.currentScenario.emotion === 'sad' ? '难过' : emotionGameState.currentScenario.emotion === 'angry' ? '生气' : '害怕'}`, 'warning');
    }

    // 更新分数
    document.getElementById('emotionScore').textContent = emotionGameState.score;
}

// 分享技能练习
let sharingGameState = {
    score: 0,
    currentScenario: null
};

const sharingScenarios = [
    { item: '🎮', text: '朋友想玩你的新游戏机', bestChoice: 'time' },
    { item: '⚽', text: '你的朋友想和你一起踢足球', bestChoice: 'share' },
    { item: '🎨', text: '妹妹想用你的彩色画笔', bestChoice: 'explain' },
    { item: '🚗', text: '弟弟想玩你最爱的玩具车', bestChoice: 'share' },
    { item: '📚', text: '同学想借你的故事书看', bestChoice: 'share' }
];

function startSharingPractice() {
    const scenario = sharingScenarios[Math.floor(Math.random() * sharingScenarios.length)];

    sharingGameState.currentScenario = scenario;

    // 更新显示
    document.getElementById('sharingItem1').textContent = scenario.item;
    document.getElementById('sharingText').querySelector('p').textContent = scenario.text;

    // 重置选择状态
    document.querySelectorAll('.item').forEach(item => {
        item.classList.remove('selected');
    });
}

function makeSharingChoice(choice) {
    if (!sharingGameState.currentScenario) return;

    let feedback = '';
    let stars = 0;

    switch(choice) {
        case 'share':
            if (sharingGameState.currentScenario.bestChoice === 'share') {
                feedback = '太棒了！分享让大家都开心，你是个大方的孩子！';
                stars = 3;
            } else {
                feedback = '分享是好事，但有时候可以考虑其他方式。';
                stars = 1;
            }
            break;

        case 'time':
            if (sharingGameState.currentScenario.bestChoice === 'time') {
                feedback = '很好的选择！轮流玩既公平又能让大家都开心！';
                stars = 3;
            } else {
                feedback = '轮流是好主意，但分享可能更合适。';
                stars = 2;
            }
            break;

        case 'explain':
            if (sharingGameState.currentScenario.bestChoice === 'explain') {
                feedback = '很棒！解释原因帮助对方理解，这是很好的沟通方式！';
                stars = 3;
            } else {
                feedback = '解释是好的，但直接分享可能更好。';
                stars = 1;
            }
            break;
    }

    showInlineMessage(feedback, stars >= 2 ? 'success' : 'info');

    if (stars > 0) {
        sharingGameState.score += stars;
        appState.addStars(stars);
        appState.updateDailyProgress(stars * 3);
    }

    // 更新分数
    document.getElementById('sharingScore').textContent = sharingGameState.score;

    // 自动开始下一个
    setTimeout(() => {
        startSharingPractice();
    }, 3000);
}

// 难度设置
function setDifficulty(level) {
    // 更新按钮状态
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // 根据难度调整游戏参数
    switch(level) {
        case 'easy':
            memoryGameState.level = 1;
            break;
        case 'medium':
            memoryGameState.level = 3;
            break;
        case 'hard':
            memoryGameState.level = 5;
            break;
    }

    showInlineMessage(`难度设置为${level === 'easy' ? '简单' : level === 'medium' ? '中等' : '困难'}`, 'info');
}

// ================ 增强注意力训练功能 ================

// 听觉专注力游戏
let auditoryGameState = {
    sequence: [],
    userSequence: [],
    level: 1,
    correctCount: 0,
    isPlaying: false
};

function startAuditoryGame() {
    auditoryGameState.sequence = [];
    auditoryGameState.userSequence = [];
    auditoryGameState.isPlaying = true;

    // 生成声音序列
    const sequenceLength = Math.min(3 + Math.floor(auditoryGameState.level / 2), 8);
    for (let i = 0; i < sequenceLength; i++) {
        auditoryGameState.sequence.push(Math.floor(Math.random() * 4) + 1);
    }

    // 显示声音按钮
    document.getElementById('sequencePlaceholder').style.display = 'none';
    document.getElementById('soundButtons').style.display = 'grid';

    // 播放序列
    playSequence();
}

function playSequence() {
    showInlineMessage('仔细听声音序列...', 'info');

    let index = 0;
    const playNext = () => {
        if (index < auditoryGameState.sequence.length) {
            const soundNum = auditoryGameState.sequence[index];
            highlightSoundButton(soundNum);
            playSoundNote(soundNum);
            index++;
            setTimeout(playNext, 800);
        } else {
            showInlineMessage('现在重复你听到的序列', 'success');
        }
    };

    setTimeout(playNext, 1000);
}

function highlightSoundButton(soundNum) {
    const button = document.querySelector(`.sound-btn[data-sound="${soundNum}"]`);
    if (button) {
        button.style.transform = 'scale(1.3)';
        button.style.background = '#3498db';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
            button.style.background = '#ecf0f1';
        }, 600);
    }
}

function playSoundNote(soundNum) {
    // 模拟不同音调的声音
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // 不同声音按钮对应不同频率
    const frequencies = [261.63, 329.63, 392.00, 523.25]; // C, E, G, C
    oscillator.frequency.value = frequencies[soundNum - 1];

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3);
}

function playSoundAndRemember(soundNum) {
    if (!auditoryGameState.isPlaying) return;

    auditoryGameState.userSequence.push(soundNum);

    // 检查当前输入
    const currentIndex = auditoryGameState.userSequence.length - 1;
    if (auditoryGameState.userSequence[currentIndex] !== auditoryGameState.sequence[currentIndex]) {
        // 错误
        showInlineMessage('序列错误！再试一次', 'warning');
        setTimeout(() => {
            playSequenceAgain();
        }, 2000);
    } else if (auditoryGameState.userSequence.length === auditoryGameState.sequence.length) {
        // 完成
        showInlineMessage('完美！你记对了整个序列', 'success');
        auditoryGameState.correctCount++;
        auditoryGameState.level++;

        appState.addStars(3);
        appState.updateDailyProgress(10);

        // 更新显示
        document.getElementById('auditoryLevel').textContent = auditoryGameState.level;
        document.getElementById('auditoryCorrect').textContent = auditoryGameState.correctCount;

        // 自动开始下一轮
        setTimeout(() => {
            startAuditoryGame();
        }, 2000);
    }

    highlightSoundButton(soundNum);
}

function playSequenceAgain() {
    auditoryGameState.userSequence = [];
    playSequence();
}

// 专注力维持游戏
let sustainedAttentionState = {
    targetCount: 0,
    distractorCount: 0,
    foundTargets: 0,
    wrongClicks: 0,
    startTime: 0,
    timeLimit: 60,
    timerInterval: null
};

function startSustainedAttention() {
    sustainedAttentionState.targetCount = 0;
    sustainedAttentionState.distractorCount = 0;
    sustainedAttentionState.foundTargets = 0;
    sustainedAttentionState.wrongClicks = 0;
    sustainedAttentionState.startTime = Date.now();

    // 生成游戏网格
    generateGameGrid();

    // 显示游戏元素
    document.querySelector('.instruction').style.display = 'none';
    document.getElementById('gameGrid').style.display = 'grid';
    document.getElementById('timerDisplay').style.display = 'flex';

    // 开始计时
    startSustainedTimer();

    showInlineMessage('找到所有🎯目标，忽略其他符号！', 'info');
}

function generateGameGrid() {
    const grid = document.getElementById('gameGrid');
    grid.innerHTML = '';

    const totalCells = 48; // 8x6网格
    const targetCount = 8 + Math.floor(Math.random() * 4); // 8-12个目标
    const distractorCount = 10 + Math.floor(Math.random() * 6); // 10-16个干扰项

    // 创建所有格子
    const cells = [];
    for (let i = 0; i < totalCells; i++) {
        cells.push({ type: 'empty', clicked: false });
    }

    // 随机放置目标
    for (let i = 0; i < targetCount; i++) {
        let pos;
        do {
            pos = Math.floor(Math.random() * totalCells);
        } while (cells[pos].type !== 'empty');
        cells[pos].type = 'target';
    }

    // 随机放置干扰项
    const distractorSymbols = ['⭐', '❤️', '🌙', '☀️', '🌈'];
    for (let i = 0; i < distractorCount; i++) {
        let pos;
        do {
            pos = Math.floor(Math.random() * totalCells);
        } while (cells[pos].type !== 'empty');
        cells[pos].type = 'distractor';
        cells[pos].symbol = distractorSymbols[Math.floor(Math.random() * distractorSymbols.length)];
    }

    // 渲染格子
    cells.forEach((cell, index) => {
        const div = document.createElement('div');
        div.className = 'grid-item';

        if (cell.type === 'target') {
            div.classList.add('target');
            div.textContent = '🎯';
            div.onclick = () => handleTargetClick(index);
        } else if (cell.type === 'distractor') {
            div.classList.add('distractor');
            div.textContent = cell.symbol;
            div.onclick = () => handleDistractorClick(index);
        } else {
            div.onclick = () => handleEmptyClick(index);
        }

        grid.appendChild(div);
    });

    sustainedAttentionState.targetCount = targetCount;
}

function handleTargetClick(index) {
    const cell = document.getElementById('gameGrid').children[index];
    if (cell.classList.contains('found')) return;

    cell.classList.add('found');
    sustainedAttentionState.foundTargets++;

    document.getElementById('targetsFound').textContent = sustainedAttentionState.foundTargets;

    // 检查是否完成
    if (sustainedAttentionState.foundTargets >= sustainedAttentionState.targetCount) {
        showInlineMessage('太棒了！你找到了所有目标！', 'success');
        endSustainedAttention();
    }
}

function handleDistractorClick(index) {
    sustainedAttentionState.wrongClicks++;
    showInlineMessage('这是干扰项，请专注于目标！', 'warning');
}

function handleEmptyClick(index) {
    sustainedAttentionState.wrongClicks++;
}

function startSustainedTimer() {
    sustainedAttentionState.timeLimit = 60;

    sustainedAttentionState.timerInterval = setInterval(() => {
        sustainedAttentionState.timeLimit--;
        document.getElementById('timeRemaining').textContent = sustainedAttentionState.timeLimit;

        if (sustainedAttentionState.timeLimit <= 0) {
            endSustainedAttention();
        }
    }, 1000);
}

function endSustainedAttention() {
    if (sustainedAttentionState.timerInterval) {
        clearInterval(sustainedAttentionState.timerInterval);
        sustainedAttentionState.timerInterval = null;
    }

    const focusTime = Math.floor((Date.now() - sustainedAttentionState.startTime) / 1000);
    const accuracy = sustainedAttentionState.targetCount > 0 ?
        Math.round((sustainedAttentionState.foundTargets / sustainedAttentionState.targetCount) * 100) : 0;

    appState.addStars(Math.floor(accuracy / 20) + 1);
    appState.updateDailyProgress(15);

    document.getElementById('accuracyRate').textContent = accuracy + '%';
    document.getElementById('focusTime').textContent = focusTime + '秒';

    // 隐藏游戏
    document.getElementById('gameGrid').style.display = 'none';
    document.getElementById('timerDisplay').style.display = 'none';
    document.querySelector('.instruction').style.display = 'block';

    showInlineMessage(`训练完成！准确率：${accuracy}%，专注时间：${focusTime}秒`, 'success');
}

// 工作记忆游戏
let workingMemoryState = {
    sequence: [],
    userSequence: [],
    length: 3,
    attempts: 0,
    successes: 0
};

const memoryItems = ['🍎', '🚗', '📚', '⚽', '🎮', '🏀', '🎨', '📱', '🎵', '🌟'];

function startWorkingMemory() {
    workingMemoryState.sequence = [];
    workingMemoryState.userSequence = [];
    workingMemoryState.attempts = 0;

    // 生成随机序列
    const shuffled = [...memoryItems].sort(() => Math.random() - 0.5);
    for (let i = 0; i < workingMemoryState.length; i++) {
        workingMemoryState.sequence.push(shuffled[i]);
    }

    // 显示记忆网格
    displayMemorySequence();
}

function displayMemorySequence() {
    const grid = document.getElementById('memoryGrid');
    grid.innerHTML = '';
    grid.style.display = 'grid';

    workingMemoryState.sequence.forEach((item, index) => {
        setTimeout(() => {
            const div = document.createElement('div');
            div.className = 'memory-item highlighted';
            div.textContent = item;
            grid.appendChild(div);

            // 清除高亮
            setTimeout(() => {
                div.classList.remove('highlighted');
                div.textContent = '?';
            }, 1000);
        }, index * 1200);
    });

    // 显示回忆区域
    setTimeout(() => {
        enableRecallMode();
    }, workingMemoryState.sequence.length * 1200 + 2000);
}

function enableRecallMode() {
    document.getElementById('recallArea').style.display = 'block';
    showInlineMessage('按顺序点击你记住的物品', 'info');

    // 创建选项格子
    const grid = document.getElementById('memoryGrid');
    const shuffledItems = [...memoryItems].sort(() => Math.random() - 0.5);

    grid.innerHTML = '';
    shuffledItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'memory-item';
        div.textContent = item;
        div.onclick = () => selectMemoryItem(item, div);
        grid.appendChild(div);
    });
}

function selectMemoryItem(item, element) {
    if (element.classList.contains('selected')) return;

    workingMemoryState.userSequence.push(item);
    element.classList.add('selected');

    // 检查是否完成
    if (workingMemoryState.userSequence.length === workingMemoryState.sequence.length) {
        checkMemorySequence();
    }
}

function checkMemorySequence() {
    workingMemoryState.attempts++;

    const isCorrect = workingMemoryState.userSequence.every((item, index) =>
        item === workingMemoryState.sequence[index]);

    if (isCorrect) {
        workingMemoryState.successes++;
        showInlineMessage('完美！记忆力真棒！', 'success');

        // 增加难度
        workingMemoryState.length = Math.min(workingMemoryState.length + 1, 12);
        appState.addStars(4);
        appState.updateDailyProgress(12);

        // 自动开始下一轮
        setTimeout(() => {
            startWorkingMemory();
        }, 2000);
    } else {
        showInlineMessage('顺序不对，再试一次！', 'warning');

        // 重置当前轮
        setTimeout(() => {
            startWorkingMemory();
        }, 2000);
    }

    // 更新统计
    const successRate = Math.round((workingMemoryState.successes / workingMemoryState.attempts) * 100);
    document.getElementById('memoryLength').textContent = workingMemoryState.length;
    document.getElementById('memorySuccess').textContent = successRate + '%';
    document.getElementById('recallArea').style.display = 'none';
}

// ================ 增强社交技能训练功能 ================

// 冲动控制训练
let impulseControlState = {
    greenCount: 0,
    redCount: 0,
    selfControlSuccess: 0,
    reactionTimes: [],
    currentSignal: null,
    signalStartTime: 0
};

function startImpulseControl() {
    showInlineMessage('看到绿灯立即点击，看到红灯要等待！', 'info');
    document.getElementById('reactionButtons').style.display = 'flex';

    // 开始第一个信号
    setTimeout(() => {
        showNextSignal();
    }, 1000);
}

function showNextSignal() {
    const signals = ['green', 'red'];
    const randomSignal = signals[Math.floor(Math.random() * signals.length)];

    impulseControlState.currentSignal = randomSignal;
    impulseControlState.signalStartTime = Date.now();

    const signalElement = document.getElementById('trafficSignal');

    if (randomSignal === 'green') {
        signalElement.textContent = '🟢';
        impulseControlState.greenCount++;

        // 绿灯随机时间后切换
        setTimeout(() => {
            signalElement.textContent = '🚦';
            setTimeout(() => {
                showNextSignal();
            }, 500 + Math.random() * 1500);
        }, 2000 + Math.random() * 3000);
    } else {
        signalElement.textContent = '🔴';
        impulseControlState.redCount++;

        // 红灯等待时间
        setTimeout(() => {
            signalElement.textContent = '🚦';
            setTimeout(() => {
                showNextSignal();
            }, 500 + Math.random() * 1500);
        }, 3000 + Math.random() * 2000);
    }
}

function handleGreenLight() {
    if (impulseControlState.currentSignal === 'green') {
        // 正确反应
        const reactionTime = Date.now() - impulseControlState.signalStartTime;
        impulseControlState.reactionTimes.push(reactionTime);
        impulseControlState.selfControlSuccess++;

        showInlineMessage('正确！反应很快！', 'success');

        appState.addStars(2);
        appState.updateDailyProgress(8);
    } else {
        // 错误反应
        showInlineMessage('现在是红灯，应该等待！', 'warning');
    }

    updateImpulseControlStats();
}

function handleRedLight() {
    if (impulseControlState.currentSignal === 'red') {
        // 正确等待
        impulseControlState.selfControlSuccess++;

        showInlineMessage('很好！你控制住了冲动！', 'success');

        appState.addStars(2);
        appState.updateDailyProgress(8);
    } else {
        // 错误等待
        showInlineMessage('现在是绿灯，应该立即点击！', 'warning');
    }

    updateImpulseControlStats();
}

function updateImpulseControlStats() {
    document.getElementById('selfControlScore').textContent = impulseControlState.selfControlSuccess;

    if (impulseControlState.reactionTimes.length > 0) {
        const avgReactionTime = Math.round(impulseControlState.reactionTimes.reduce((a, b) => a + b, 0) / impulseControlState.reactionTimes.length);
        document.getElementById('reactionTime').textContent = avgReactionTime + 'ms';
    }
}

// 课堂行为训练
let classroomBehaviorState = {
    correctBehaviorCount: 0,
    totalChoices: 0,
    focusMinutes: 0,
    startTime: 0,
    currentScenario: null
};

const classroomScenarios = [
    {
        teacherText: "同学们，请打开课本第20页",
        goodBehaviors: ['listen', 'participate'],
        badBehaviors: ['disturb', 'talk'],
        context: "开始上课时"
    },
    {
        teacherText: "谁能告诉我这道题的答案？",
        goodBehaviors: ['participate', 'ask'],
        badBehaviors: ['talk', 'disturb'],
        context: "提问环节"
    },
    {
        teacherText: "请大家安静自习，有问题举手",
        goodBehaviors: ['listen', 'ask'],
        badBehaviors: ['talk', 'disturb'],
        context: "自习时间"
    },
    {
        teacherText: "现在我们做练习题，有不懂的可以问我",
        goodBehaviors: ['participate', 'ask'],
        badBehaviors: ['talk', 'disturb'],
        context: "练习时间"
    }
];

function startClassroomTraining() {
    classroomBehaviorState.correctBehaviorCount = 0;
    classroomBehaviorState.totalChoices = 0;
    classroomBehaviorState.startTime = Date.now();

    showScenario();
}

function showScenario() {
    const scenario = classroomScenarios[Math.floor(Math.random() * classroomScenarios.length)];
    classroomBehaviorState.currentScenario = scenario;

    document.getElementById('teacherSpeech').textContent = scenario.teacherText;

    showInlineMessage(`课堂情景：${scenario.context}`, 'info');
}

function chooseBehavior(behavior) {
    if (!classroomBehaviorState.currentScenario) return;

    classroomBehaviorState.totalChoices++;

    const isGood = classroomBehaviorState.currentScenario.goodBehaviors.includes(behavior);
    const isBad = classroomBehaviorState.currentScenario.badBehaviors.includes(behavior);

    if (isGood) {
        classroomBehaviorState.correctBehaviorCount++;
        showInlineMessage('很好的选择！这是正确的课堂行为', 'success');

        appState.addStars(3);
        appState.updateDailyProgress(10);
    } else if (isBad) {
        showInlineMessage('这种行为会影响上课效果，下次要改进', 'warning');
    } else {
        showInlineMessage('这是个合理的选择', 'info');
    }

    updateClassroomStats();

    // 显示下一个情景
    setTimeout(() => {
        showScenario();
    }, 3000);
}

function updateClassroomStats() {
    document.getElementById('correctBehavior').textContent = classroomBehaviorState.correctBehaviorCount;

    const focusMinutes = Math.floor((Date.now() - classroomBehaviorState.startTime) / 60000);
    document.getElementById('focusDuration').textContent = focusMinutes + '分钟';
}

// 情绪调节训练
let emotionRegulationState = {
    regulationSuccess: 0,
    strategyMastery: 0,
    currentScenario: null,
    currentEmotion: null
};

// 只用于情绪调节的负面情绪情景
const negativeEmotionScenarios = [
    { emotion: 'sad', text: '小红的宠物狗走丢了', character: '😢', intensity: 9 },
    { emotion: 'angry', text: '有人不小心把小华的作业弄湿了', character: '😠', intensity: 7 },
    { emotion: 'scared', text: '小李晚上听到奇怪的声音', character: '😰', intensity: 6 },
    { emotion: 'sad', text: '最好的朋友要搬家了', character: '😢', intensity: 8 },
    { emotion: 'angry', text: '被同学冤枉了', character: '😠', intensity: 9 },
    { emotion: 'scared', text: '要在全班同学面前演讲', character: '😰', intensity: 7 }
];

function startEmotionRegulation() {
    const scenario = negativeEmotionScenarios[Math.floor(Math.random() * negativeEmotionScenarios.length)];
    emotionRegulationState.currentScenario = scenario;
    emotionRegulationState.currentEmotion = scenario.emotion;

    // 更新显示
    const emotionIcons = {
        'angry': '😤',
        'sad': '😢',
        'scared': '😰'
    };

    document.getElementById('situationIcon').textContent = emotionIcons[scenario.emotion];
    document.getElementById('situationText').textContent = scenario.text;
    document.getElementById('emotionLevel').textContent = `情绪强度：${scenario.intensity}/10`;

    showInlineMessage('选择一个方法来调节你的情绪', 'info');
}

function useStrategy(strategy) {
    if (!emotionRegulationState.currentScenario) return;

    const bestStrategy = emotionRegulationState.currentScenario.bestStrategy;
    const strategyNames = {
        'breathing': '深呼吸',
        'counting': '数数到10',
        'thinking': '积极思考',
        'seeking': '寻求帮助',
        'distraction': '转移注意力'
    };

    if (strategy === bestStrategy) {
        emotionRegulationState.regulationSuccess++;
        emotionRegulationState.strategyMastery++;

        showInlineMessage(`太棒了！${strategyNames[strategy]}是很好的调节方法`, 'success');

        appState.addStars(3);
        appState.updateDailyProgress(12);
    } else {
        showInlineMessage(`${strategyNames[strategy]}也是个好方法，但下次可以试试其他策略`, 'info');

        appState.addStars(1);
        appState.updateDailyProgress(5);
    }

    // 更新统计
    document.getElementById('regulationSuccess').textContent = emotionRegulationState.regulationSuccess;
    document.getElementById('strategyMastery').textContent = emotionRegulationState.strategyMastery;

    // 显示下一个情景
    setTimeout(() => {
        startEmotionRegulation();
    }, 3000);
}

// 同伴关系训练
let peerRelationshipState = {
    positiveInteraction: 0,
    friendshipIndex: 0,
    currentScenario: null
};

const peerScenarios = [
    {
        situation: "看到其他同学在玩有趣的足球游戏",
        positiveActions: ['invite', 'share'],
        negativeActions: ['force', 'ignore'],
        context: "体育运动"
    },
    {
        situation: "你想加入正在讨论的同学小组",
        positiveActions: ['observe', 'join'],
        negativeActions: ['force', 'ignore'],
        context: "学习小组"
    },
    {
        situation: "同学想借你的新玩具车",
        positiveActions: ['share', 'invite'],
        negativeActions: ['force', 'ignore'],
        context: "玩具分享"
    },
    {
        situation: "有人邀请你参加生日派对",
        positiveActions: ['invite', 'share'],
        negativeActions: ['force', 'ignore'],
        context: "社交活动"
    }
];

function startPeerTraining() {
    const scenario = peerScenarios[Math.floor(Math.random() * peerScenarios.length)];
    peerRelationshipState.currentScenario = scenario;

    document.getElementById('interactionText').textContent = scenario.situation;

    showInlineMessage(`同伴互动：${scenario.context}`, 'info');
}

function handlePeerSituation(action) {
    if (!peerRelationshipState.currentScenario) return;

    const isPositive = peerRelationshipState.currentScenario.positiveActions.includes(action);
    const isNegative = peerRelationshipState.currentScenario.negativeActions.includes(action);

    const actionNames = {
        'join': '主动加入',
        'invite': '邀请玩耍',
        'share': '分享物品',
        'force': '强行加入',
        'ignore': '忽略他人',
        'observe': '先观察'
    };

    if (isPositive) {
        peerRelationshipState.positiveInteraction++;
        peerRelationshipState.friendshipIndex += 2;

        showInlineMessage(`很好的选择！${actionNames[action]}有助于建立友谊`, 'success');

        appState.addStars(3);
        appState.updateDailyProgress(10);
    } else if (isNegative) {
        peerRelationshipState.friendshipIndex = Math.max(0, peerRelationshipState.friendshipIndex - 1);

        showInlineMessage(`这种行为可能影响友谊，试试更积极的方式`, 'warning');

        appState.addStars(0);
    } else {
        peerRelationshipState.positiveInteraction++;
        peerRelationshipState.friendshipIndex += 1;

        showInlineMessage(`不错的选择！${actionNames[action]}是合理的做法`, 'info');

        appState.addStars(1);
        appState.updateDailyProgress(5);
    }

    // 更新统计
    document.getElementById('positiveInteraction').textContent = peerRelationshipState.positiveInteraction;
    document.getElementById('friendshipIndex').textContent = peerRelationshipState.friendshipIndex;

    // 显示下一个情景
    setTimeout(() => {
        startPeerTraining();
    }, 3000);
}

// 为输入框添加回车键支持
document.addEventListener('DOMContentLoaded', function() {
    const memoryInput = document.getElementById('memoryInput');
    if (memoryInput) {
        memoryInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkMemoryAnswer();
            }
        });
    }
});

// 验证所有必需的函数是否已定义
function validateFunctions() {
    const requiredFunctions = [
        'showScreen', 'startDailyTraining', 'startModule', 'startScenario', 'selectEmotion', 'makeChoice',
        'nextScenario', 'startBreathing', 'stopBreathing', 'shareProgress', 'startMemoryGame',
        'checkMemoryAnswer', 'startDifferenceGame', 'renderPattern', 'checkDifference', 'startTurnTaking',
        'takeTurn', 'listenCarefully', 'askQuestion', 'updateTurnTakingScore', 'startEmotionRecognition',
        'selectEmotionChoice', 'startSharingPractice', 'makeSharingChoice', 'setDifficulty',
        'startAuditoryGame', 'playSequence', 'highlightSoundButton', 'playSoundNote', 'playSoundAndRemember',
        'playSequenceAgain', 'startSustainedAttention', 'generateGameGrid', 'handleTargetClick',
        'handleDistractorClick', 'handleEmptyClick', 'startSustainedTimer', 'endSustainedAttention',
        'startWorkingMemory', 'displayMemorySequence', 'enableRecallMode', 'selectMemoryItem',
        'checkMemorySequence', 'startImpulseControl', 'showNextSignal', 'handleGreenLight',
        'handleRedLight', 'updateImpulseControlStats', 'startClassroomTraining', 'showScenario',
        'chooseBehavior', 'updateClassroomStats', 'startEmotionRegulation', 'useStrategy',
        'startPeerTraining', 'handlePeerSituation', 'playSound', 'showInlineMessage'
    ];

    let missingFunctions = [];
    requiredFunctions.forEach(funcName => {
        if (typeof window[funcName] !== 'function') {
            missingFunctions.push(funcName);
        }
    });

    if (missingFunctions.length > 0) {
        console.error('Missing functions:', missingFunctions);
    } else {
        console.log('All functions defined successfully');
    }
}

// 页面加载后验证函数
document.addEventListener('DOMContentLoaded', function() {
    validateFunctions();
});

// 为输入框添加回车键支持
document.addEventListener('DOMContentLoaded', function() {
    const memoryInput = document.getElementById('memoryInput');
    if (memoryInput) {
        memoryInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkMemoryAnswer();
            }
        });
    }
});

// 为按钮添加音效
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', function() {
        if (this.classList.contains('primary-btn') || this.classList.contains('choice-btn')) {
            playSound('button');
        }
    });
});