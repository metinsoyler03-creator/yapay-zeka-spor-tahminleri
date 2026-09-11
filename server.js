const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 5000;
const API_KEY = process.env.API_KEY || '520dcfab308c3ca3826e317ad60717a8';

// Statik dosyaları (index.html) dışarıya açıyoruz
app.use(express.static(path.join(__dirname)));

// Ana sayfaya girildiğinde doğrudan index.html dosyasını sunuyoruz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Maç verilerini getiren API uç noktası
app.get('/api/matches', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const response = await axios.get('https://v3.football.api-sports.io/fixtures', {
            headers: {
                'x-apisports-key': API_KEY
            },
            params: {
                date: today,
                timezone: 'Europe/Istanbul'
            }
        });

        const matches = response.data.response.map(item => {
            const statusShort = item.fixture.status.short;
            let statusCode = 'SCHEDULED';
            
            if (['1H', 'HT', '2H', 'ET', 'P', 'BT', 'LIVE'].includes(statusShort)) {
                statusCode = 'LIVE';
            } else if (['FT', 'AET', 'PEN'].includes(statusShort)) {
                statusCode = 'FINISHED';
            }

            return {
                id: item.fixture.id,
                league: item.league.name,
                home: item.teams.home.name,
                away: item.teams.away.name,
                score: `${item.goals.home ?? 0} - ${item.goals.away ?? 0}`,
                time: statusShort === 'NS' ? new Date(item.fixture.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : item.fixture.status.elapsed + "'",
                statusCode: statusCode,
                pick: "MS 1",
                odds: (1.50 + Math.random() * 1.50).toFixed(2)
            };
        });

        res.json(matches);
    } catch (error) {
        console.error("API Hatası:", error.message);
        res.status(500).json({ error: "Veriler çekilirken hata oluştu." });
    }
});

app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda aktif.`);
});
