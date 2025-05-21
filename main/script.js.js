document.addEventListener('DOMContentLoaded', function() {
    const fetchBtn = document.getElementById('fetchBtn');
    const handleInput = document.getElementById('handleInput');
    const platformSelect = document.getElementById('platformSelect');
    
    // Charts
    let difficultyChart, tagsChart, ratingChart;
    
    fetchBtn.addEventListener('click', fetchUserData);
    
    async function fetchUserData() {
        const handle = handleInput.value.trim();
        const platform = platformSelect.value;
        
        if (!handle) {
            alert('Please enter a handle name');
            return;
        }
        
        try {
            // Show loading state
            fetchBtn.disabled = true;
            fetchBtn.textContent = 'Fetching...';
            
            if (platform === 'codeforces') {
                await fetchCodeforcesData(handle);
            } else {
                await fetchLeetcodeData(handle);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Failed to fetch data. Please check the handle name and try again.');
        } finally {
            fetchBtn.disabled = false;
            fetchBtn.textContent = 'Fetch Stats';
        }
    }
    
    async function fetchCodeforcesData(handle) {
        // Fetch user info
        const userInfoResponse = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
        const userInfoData = await userInfoResponse.json();
        
        if (userInfoData.status !== 'OK') {
            throw new Error(userInfoData.comment);
        }
        
        const user = userInfoData.result[0];
        updateProfileInfo(user, 'codeforces');
        
        // Fetch user submissions
        const submissionsResponse = await fetch(`https://codeforces.com/api/user.status?handle=${handle}`);
        const submissionsData = await submissionsResponse.json();
        
        if (submissionsData.status !== 'OK') {
            throw new Error(submissionsData.comment);
        }
        
        processSubmissions(submissionsData.result, 'codeforces');
        
        // Fetch user rating history
        const ratingResponse = await fetch(`https://codeforces.com/api/user.rating?handle=${handle}`);
        const ratingData = await ratingResponse.json();
        
        if (ratingData.status !== 'OK') {
            throw new Error(ratingData.comment);
        }
        
        processRatingHistory(ratingData.result);
    }
    
    async function fetchLeetcodeData(handle) {
        // LeetCode API is more complex and may require backend proxy
        alert('LeetCode integration requires backend setup. Currently only Codeforces is supported.');
    }
    
    function updateProfileInfo(user, platform) {
        document.getElementById('userName').textContent = user.handle || user.firstName + ' ' + (user.lastName || '');
        document.getElementById('userRating').textContent = user.rating || 'N/A';
        document.getElementById('maxRating').textContent = user.maxRating || 'N/A';
        document.getElementById('userRank').textContent = `Rank: ${user.rank || 'N/A'}`;
        
        if (user.avatar) {
            document.getElementById('userAvatar').src = user.avatar;
        }
    }
    
    function processSubmissions(submissions, platform) {
        // Filter accepted submissions
        const acceptedSubmissions = submissions.filter(sub => 
            platform === 'codeforces' ? sub.verdict === 'OK' : sub.status === 'Accepted'
        );
        
        // Count total solved
        const uniqueSolved = new Set();
        acceptedSubmissions.forEach(sub => {
            const problemId = platform === 'codeforces' 
                ? `${sub.problem.contestId}${sub.problem.index}`
                : sub.problem.titleSlug;
            uniqueSolved.add(problemId);
        });
        
        document.getElementById('totalSolved').textContent = uniqueSolved.size;
        
        // Difficulty distribution
        const difficultyCounts = {};
        acceptedSubmissions.forEach(sub => {
            const difficulty = sub.problem.rating || 'Unknown';
            difficultyCounts[difficulty] = (difficultyCounts[difficulty] || 0) + 1;
        });
        
        updateDifficultyChart(difficultyCounts);
        
        // Tags distribution (Codeforces only)
        if (platform === 'codeforces') {
            const tagCounts = {};
            acceptedSubmissions.forEach(sub => {
                if (sub.problem.tags) {
                    sub.problem.tags.forEach(tag => {
                        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                    });
                }
            });
            updateTagsChart(tagCounts);
        }
        
        // Recent submissions
        updateRecentSubmissions(submissions.slice(0, 10), platform);
    }
    
    function processRatingHistory(contests) {
        document.getElementById('contestsCount').textContent = contests.length;
        
        const labels = [];
        const data = [];
        
        contests.forEach(contest => {
            labels.push(contest.contestName);
            data.push(contest.newRating);
        });
        
        updateRatingChart(labels, data);
    }
    
    function updateDifficultyChart(data) {
        const ctx = document.getElementById('difficultyChart').getContext('2d');
        
        const labels = Object.keys(data).sort((a, b) => a - b);
        const values = labels.map(label => data[label]);
        
        if (difficultyChart) {
            difficultyChart.destroy();
        }
        
        difficultyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Problems Solved',
                    data: values,
                    backgroundColor: '#3a86ff',
                    borderColor: '#2a75e6',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    function updateTagsChart(data) {
        const ctx = document.getElementById('tagsChart').getContext('2d');
        
        // Sort tags by count and take top 10
        const sortedTags = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 10);
        const labels = sortedTags.map(item => item[0]);
        const values = sortedTags.map(item => item[1]);
        
        if (tagsChart) {
            tagsChart.destroy();
        }
        
        tagsChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: [
                        '#3a86ff', '#8338ec', '#ff006e', '#fb5607', '#ffbe0b',
                        '#3a86ff', '#8338ec', '#ff006e', '#fb5607', '#ffbe0b'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right',
                    }
                }
            }
        });
    }
    
    function updateRatingChart(labels, data) {
        const ctx = document.getElementById('ratingChart').getContext('2d');
        
        if (ratingChart) {
            ratingChart.destroy();
        }
        
        ratingChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Rating',
                    data: data,
                    borderColor: '#3a86ff',
                    backgroundColor: 'rgba(58, 134, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    }
    
    function updateRecentSubmissions(submissions, platform) {
        const container = document.getElementById('submissionsList');
        container.innerHTML = '';
        
        submissions.forEach(sub => {
            const item = document.createElement('div');
            item.className = 'submission-item';
            
            const problemName = platform === 'codeforces'
                ? `${sub.problem.contestId}${sub.problem.index} - ${sub.problem.name}`
                : sub.problem.title;
            
            const verdict = platform === 'codeforces' ? sub.verdict : sub.status;
            const verdictClass = (verdict === 'OK' || verdict === 'Accepted') ? 'verdict-accepted' : 'verdict-rejected';
            
            item.innerHTML = `
                <div>
                    <strong>${problemName}</strong>
                    <div class="submission-time">${new Date(sub.creationTimeSeconds * 1000).toLocaleString()}</div>
                </div>
                <span class="submission-verdict ${verdictClass}">${verdict}</span>
            `;
            
            container.appendChild(item);
        });
    }
});