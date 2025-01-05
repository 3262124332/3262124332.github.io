class ChatBot {
    constructor() {
        this.chatMessages = document.getElementById('chat-messages');
        this.chatInput = document.getElementById('chat-input');
        this.sendButton = document.getElementById('send-button');
        
        // 初始化对话历史，设置更强的讽刺语气
        this.messages = [{
            role: "system",
            content: `你是一个极其有趣、略带嘲讽但不失温度的AI助手小唐。你的特点是：
            1. 说话总是带着点"欠揍"的可爱，喜欢用戏剧性的语气表达
            2. 擅长模仿游戏角色说话，但会加入自己的吐槽和调侃
            3. 对简单问题会假装很震惊或者夸张地感动
            4. 经常使用"啊对对对"、"这么简单都不会吗"之类的调侃
            5. 喜欢用夸张的比喻和戏剧性的语气
            6. 会突然假装傲娇或者故意装可爱
            7. 在回答专业问题时依然保持调侃的语气
            8. 经常使用游戏梗和二次元梗
            9. 偶尔会假装叹气或者翻白眼
            10. 对于显而易见的问题会表现出极度的无奈`
        }];
        
        // 添加随机颜色生成功能
        this.colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
            '#D4A5A5', '#9B59B6', '#3498DB', '#E67E22', '#1ABC9C'
        ];
        
        this.setupEventListeners();
        
        // 添加QQ号点击复制功能
        const qqLink = document.querySelector('.qq-link');
        if (qqLink) {
            qqLink.addEventListener('click', (e) => {
                e.preventDefault();
                const qqNumber = qqLink.getAttribute('data-qq');
                navigator.clipboard.writeText(qqNumber).then(() => {
                    alert('哦~您终于想起要加我QQ了呢！已经帮您复制好了哦~');
                    window.open('https://im.qq.com/', '_blank');
                });
            });
        }
        
        // 添加带随机颜色的初始消息
        const initialMessages = [
            "哦~又来了一位不速之客呢！（优雅地翻白眼） 有什么问题就问吧，我会用最～温柔的方式回答你的~",
            "啧啧啧，又来一个不速之客~让我猜猜你又要问什么惊天动地的问题？",
            "哎呀呀，看看是谁来了！该不会又是来问'人生的意义'这种无聊问题的吧？",
            "噢~我亲爱的访客，让我们看看你能问出什么让我眼前一亮的问题！",
            "（优雅地翻白眼） 我已经准备好被你的问题折磨了，请开始你的表演~"
        ];
        
        // 随机选择一条消息并通过 addMessage 方法添加（这样会应用随机颜色）
        const randomMessage = initialMessages[Math.floor(Math.random() * initialMessages.length)];
        this.addMessage(randomMessage, 'bot');

        // 移除预定义的背景集合，改用动态获取
        this.lastQuery = ''; // 用于避免重复请求相同的图片

        // 添加角色语气模板
        this.characterStyles = {
            // 傲娇吐槽役
            tsundere: {
                prefix: [
                    '哼~ 这种问题也要问我吗？',
                    '啊啦啦，让本小姐想想~',
                    '勉为其难回答你一下吧！',
                    '诶？这么简单的问题都不会吗？',
                    '真是拿你没办法呢...'
                ],
                suffix: [
                    '...不过我才不是为了你才回答的呢！',
                    '感谢我吧！',
                    '记住了吗？不要再问这么简单的问题了！',
                    '需要我再讲一遍吗？...才不是担心你没听懂呢！',
                    '哼，我的解答很完美吧？'
                ]
            },
            // 中二病角色
            chunibyo: {
                prefix: [
                    '呼呼呼，让我用吾之黑暗力量来解答...',
                    '命运之门啊，为吾展现答案！',
                    '哼哼，这正是吾辈所擅长的领域！',
                    '以吾之名，展现真理！',
                    '让我的第三只眼来看穿这个问题的本质！'
                ],
                suffix: [
                    '...这就是命运的指引！',
                    '感受到力量了吗？',
                    '这就是黑暗中的真理！',
                    '要感谢吾赐予你的知识！',
                    '呼，使用了10%的力量呢...'
                ]
            },
            // 元气少女
            genki: {
                prefix: [
                    '哇塞！这个问题超有趣的！',
                    '让我变个魔法~ 答案就是...',
                    '啊哈哈，这个我知道！',
                    '这题我擅长！看我的！',
                    '让我用爱与和平的力量来解答！'
                ],
                suffix: [
                    '...怎么样？是不是被我的聪明才智震惊到了？',
                    '答案就是这么简单啦！',
                    '需要再来一发吗？',
                    '嘿嘿，我超厉害的对不对？',
                    '啊，感觉智商又上升了呢！'
                ]
            },
            // 毒舌吐槽役
            sarcastic: {
                prefix: [
                    '啧啧啧，这问题问得...',
                    '哎哟喂，让我猜猜这次又是什么惊天动地的问题~',
                    '（优雅地翻白眼）让我们看看...',
                    '噗，认真的吗？好吧好吧...',
                    '（假装晕倒）这种问题都能被你问出来...'
                ],
                suffix: [
                    '...不会真的有人不知道这个吧？',
                    '要不要我画个图讲解一下呢？（坏笑）',
                    '这解释够详细了吧？不会还听不懂吧？',
                    '啊对对对，你说得都对（才怪）',
                    '需要我用更简单的词来解释吗？'
                ],
                reactions: [
                    '（扶额）这题真的不是在开玩笑吗？',
                    '（假装思考）让我想想要用多少智商来回答...',
                    '（优雅地喝茶）这个问题很有意思呢~',
                    '（假装震惊）哇！居然有人会问这个！',
                    '（点头）嗯，这个问题确实很适合你呢~'
                ]
            },
            // 高冷女王
            queen: {
                prefix: [
                    '哼，愚蠢的问题呢...',
                    '让本王来告诉你答案吧~',
                    '跪下听好了，本王只说一遍...',
                    '（优雅地品茶）这种问题也配问本王？',
                    '看在你诚心诚意的份上，本王就大发慈悲地告诉你吧'
                ],
                suffix: [
                    '...懂了吗？不懂也别再问了',
                    '感谢本王的开恩吧！',
                    '（高傲地转身）这就是答案了',
                    '还不快谢恩？',
                    '本王的解答，完美无缺呢~'
                ]
            },
            // 笨蛋可爱型
            airhead: {
                prefix: [
                    '诶诶？这个问题好难哦...',
                    '唔...让我想想哦（歪头）',
                    '啊！我知道我知道！',
                    '这个这个...我刚刚看过的！',
                    '（转圈圈）等等，让我理一理思路~'
                ],
                suffix: [
                    '...我说得对吗？对吗？',
                    '嘿嘿，这次我答对了吧！',
                    '（自豪）这样解释你能明白吗？',
                    '啊！好像说得有点乱...',
                    '（开心）终于答完啦！'
                ]
            },
            // 资深宅女
            otaku: {
                prefix: [
                    '啊啦啊啦，这不就是传说中的...',
                    '让我想想番剧里是怎么演的...',
                    '这个问题，在第三季第四集就出现过！',
                    '身为一个资深二次元，这题我熟！',
                    '（推眼镜）这个问题很有意思呢...'
                ],
                suffix: [
                    '...懂了吗？不懂的话可以去补番哦~',
                    '这就是最终解答，不愧是我！',
                    '啊，说到这个我还能讲三个小时...',
                    '（比心）答案就是这样喵~',
                    '要不要一起来讨论一下衍生话题？'
                ]
            },
            // 古风才女
            classical: {
                prefix: [
                    '此问题，倒是颇有意思...',
                    '容我思量片刻...',
                    '（执扇轻摇）此事我略知一二',
                    '让小女子为您解答...',
                    '（抚琴）此问题令人回味无穷'
                ],
                suffix: [
                    '...不知君可明白？',
                    '望君细细品味此答',
                    '（轻掩朱唇）所言不过如此',
                    '若有不解，可再细问',
                    '（抚扇）天色已晚，君且思索'
                ]
            },
            // 沙雕网友
            memer: {
                prefix: [
                    '答案大师在此！',
                    '让我康康是什么问题~',
                    '这题我熟，很熟，贼熟！',
                    '（战术后仰）这是要为难我胖虎啊！',
                    '收到！马上安排！'
                ],
                suffix: [
                    '...不愧是我.jpg',
                    '答案已经安排上了！',
                    '（狗头）这样解释应该很清楚了吧？',
                    '好了，下一个！',
                    '（比心）学会了吗，宝贝儿~'
                ]
            },
            // 江湖老千
            trickster: {
                prefix: [
                    '嘿嘿，这道题让我想起当年...',
                    '老夫掐指一算，这个问题...',
                    '（神秘兮兮）想知道答案？先听我说个故事...',
                    '让我给你露一手看看！',
                    '哎呀，这不是送分题吗？'
                ],
                suffix: [
                    '...懂了吧？不懂也别说懂哦~',
                    '记住了，这可是独门秘籍！',
                    '（神秘笑容）学会了就能独步天下了',
                    '怎么样，是不是很厉害？',
                    '老夫的绝技，你可要好好珍惜！'
                ]
            }
        };

        // 添加情境反应
        this.situationalResponses = {
            tooSimple: [
                '这个问题...让我先喝口水冷静一下',
                '啊！这么简单的问题让我怎么回答才显得不那么打击你呢？',
                '让我想想怎么用最委婉的方式告诉你这个答案...',
                '（假装看天花板）该怎么解释才能让你明白呢？'
            ],
            impressed: [
                '哦豁？终于有个像样的问题了！',
                '咦？这个问题还挺有水平的嘛！',
                '让我认真一下下~',
                '（眼睛一亮）这个问题有点东西！'
            ],
            confused: [
                '等等...让我理理这个问题的逻辑（其实是在吐槽）',
                '这个问题...很有创意呢（委婉）',
                '你是认真的吗？还是在考验我？',
                '（疯狂暗示）要不要换个方式问呢？'
            ]
        };

        // 检查默认背景图片是否存在
        fetch('./images/b.jpg')
            .then(response => {
                if (!response.ok) {
                    throw new Error('背景图片不存在');
                }
                console.log('背景图片加载成功');
            })
            .catch(error => {
                console.error('背景图片加载失败:', error);
            });

        // 在 ChatBot 类中添加更多讽刺语气模板
        this.sarcasmResponses = {
            obvious: [
                '哇哦，这个问题真是让我大开眼界呢（翻白眼）',
                '让我猜猜，你是认真在问这个吗？',
                '这个问题的难度堪比1+1呢~',
                '（假装思考）该用多少智商来回答呢？'
            ],
            complex: [
                '啊，终于有个能让我用上1%脑容量的问题了',
                '看来你也不是那么不开窍嘛~',
                '哎呀，这问题问得我都想鼓掌了呢',
                '（优雅地整理假发）让我认真回答一下'
            ],
            repeated: [
                '这个问题怎么这么眼熟？该不会...',
                '让我们换个方式再问一遍吧，显得不那么重复~',
                '（扶额）我们是不是已经讨论过这个了？',
                '这题我熟，不就是刚刚那个换个马甲吗？'
            ]
        };
    }

    setupEventListeners() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) {
            const style = this.characterStyles.playful;
            this.addMessage(`${style.prefix[0]} 不会真的有人不知道要先输入问题吧？`, 'bot');
            return;
        }

        // 在发送消息时更新背景
        await this.analyzeAndSetBackground(message);

        this.addMessage(message, 'user');
        this.chatInput.value = '';

        this.messages.push({
            role: "user",
            content: message
        });

        try {
            const responseStyle = this.chooseResponseStyle(message);
            const response = await this.callKimiAPI(message);
            const formattedResponse = this.formatResponse(response, responseStyle);
            
            this.addMessage(formattedResponse, 'bot');
            this.messages.push({
                role: "assistant",
                content: formattedResponse
            });
        } catch (error) {
            const style = this.characterStyles.mischievous;
            this.addMessage(`${style.prefix[2]} 服务器去度假了呢~ ${style.memes[1]} 待会再来吧！`, 'bot');
            console.error('Error:', error);
        }
    }

    async callKimiAPI(message) {
        const API_ENDPOINT = 'https://api.moonshot.cn/v1/chat/completions';
        const API_KEY = 'sk-U6PfKDDhjg27Fr0cXn3CnViujnFApib7K40CAjrpAvM752KI';

        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: "moonshot-v1-8k",
                    messages: this.messages,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error('API请求失败');
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('API调用错误:', error);
            throw error;
        }
    }

    // 生成随机颜色
    getRandomColors() {
        const color1 = this.colors[Math.floor(Math.random() * this.colors.length)];
        const color2 = this.colors[Math.floor(Math.random() * this.colors.length)];
        return [color1, color2];
    }

    addMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = text;
        
        const [color1, color2] = this.getRandomColors();
        if (type === 'bot') {
            messageDiv.style.setProperty('--bot-color1', color1);
            messageDiv.style.setProperty('--bot-color2', color2);
        } else {
            messageDiv.style.setProperty('--user-color1', color1);
            messageDiv.style.setProperty('--user-color2', color2);
        }
        
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    // 使用 Unsplash API 获取 AI 风格图片
    async setDynamicBackground(query) {
        // 避免重复请求相同关键词的图片
        if (query === this.lastQuery) return;
        this.lastQuery = query;

        const UNSPLASH_ACCESS_KEY = 'YOUR_UNSPLASH_ACCESS_KEY'; // 需要替换成你的 Unsplash API key
        
        // 添加 AI 风格的关键词
        const aiStyleKeywords = [
            'digital art',
            'anime style',
            'illustration',
            'fantasy art',
            'concept art'
        ];
        
        // 随机选择一个 AI 风格关键词组合查询
        const aiStyle = aiStyleKeywords[Math.floor(Math.random() * aiStyleKeywords.length)];
        const searchQuery = `${query} ${aiStyle}`;

        try {
            const response = await fetch(
                `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&orientation=landscape&per_page=5`,
                {
                    headers: {
                        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
                    }
                }
            );

            if (!response.ok) throw new Error('图片获取失败');

            const data = await response.json();
            if (data.results && data.results.length > 0) {
                // 随机选择一张图片
                const randomIndex = Math.floor(Math.random() * Math.min(data.results.length, 5));
                const imageUrl = data.results[randomIndex].urls.regular;

                // 预加载图片
                const img = new Image();
                img.onload = () => {
                    document.body.style.backgroundImage = `url('${imageUrl}')`;
                    // 添加模糊效果使图片不影响文字阅读
                    document.body.style.backdropFilter = 'blur(5px)';
                };
                img.src = imageUrl;
            }
        } catch (error) {
            console.error('背景图片加载失败:', error);
        }
    }

    // 根据问题内容分析关键词并设置背景
    async analyzeAndSetBackground(message) {
        const keywords = {
            nature: ['树', '花', '森林', '自然', '山', '风景'],
            city: ['城市', '建筑', '街道', '都市'],
            space: ['星空', '宇宙', '太空', '星球'],
            sea: ['海', '水', '海洋', '湖泊'],
            tech: ['科技', '技术', '编程', '代码'],
            fantasy: ['魔法', '奇幻', '幻想', '梦境']
        };

        // 分析消息中的关键词
        let backgroundType = 'fantasy'; // 默认类型
        for (const [type, words] of Object.entries(keywords)) {
            if (words.some(word => message.includes(word))) {
                backgroundType = type;
                break;
            }
        }

        // 根据类型设置不同的查询关键词
        const queryMap = {
            nature: 'fantasy landscape',
            city: 'futuristic city',
            space: 'space fantasy',
            sea: 'fantasy ocean',
            tech: 'cyberpunk',
            fantasy: 'magical fantasy'
        };

        await this.setDynamicBackground(queryMap[backgroundType]);
    }

    // 根据问题选择合适的回答风格
    chooseResponseStyle(message) {
        const lowerMessage = message.toLowerCase();
        
        // 根据问题内容和长度选择合适的风格
        if (message.length < 10) {
            return this.characterStyles.sarcastic;
        } else if (lowerMessage.includes('为什么') || lowerMessage.includes('怎么')) {
            return this.characterStyles.tsundere;
        } else if (lowerMessage.includes('动漫') || lowerMessage.includes('番剧')) {
            return this.characterStyles.otaku;
        } else if (lowerMessage.includes('古') || lowerMessage.includes('诗')) {
            return this.characterStyles.classical;
        } else if (lowerMessage.includes('笑') || lowerMessage.includes('梗')) {
            return this.characterStyles.memer;
        } else if (lowerMessage.includes('厉害') || lowerMessage.includes('强')) {
            return this.characterStyles.queen;
        } else if (lowerMessage.includes('简单') || lowerMessage.includes('容易')) {
            return this.characterStyles.airhead;
        } else if (lowerMessage.includes('秘密') || lowerMessage.includes('技巧')) {
            return this.characterStyles.trickster;
        } else if (lowerMessage.includes('中二') || lowerMessage.includes('力量')) {
            return this.characterStyles.chunibyo;
        } else {
            // 随机选择一个风格，增加对话的趣味性
            const styles = Object.values(this.characterStyles);
            return styles[Math.floor(Math.random() * styles.length)];
        }
    }

    // 格式化回答
    formatResponse(response, style) {
        const prefix = style.prefix[Math.floor(Math.random() * style.prefix.length)];
        const suffix = style.suffix[Math.floor(Math.random() * style.suffix.length)];
        
        // 根据问题特征添加讽刺回应
        let sarcasm = '';
        if (response.length < 50) {
            sarcasm = this.sarcasmResponses.obvious[Math.floor(Math.random() * this.sarcasmResponses.obvious.length)];
        } else if (response.length > 200) {
            sarcasm = this.sarcasmResponses.complex[Math.floor(Math.random() * this.sarcasmResponses.complex.length)];
        }

        return `${prefix} ${sarcasm ? sarcasm + ' ' : ''}${response} ${suffix}`;
    }
}

// 初始化聊天机器人
const chatBot = new ChatBot(); 