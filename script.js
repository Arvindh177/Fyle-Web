let currentPage = 1;
        let totalPages = 1;
        let reposPerPage = 10; // Default value is now 10

        async function getRepositories() {
            const username = document.getElementById('username').value;
            const userInfoDiv = document.getElementById('user-info');
            const repositoriesDiv = document.getElementById('repositories');
            const paginationDiv = document.getElementById('pagination');

            userInfoDiv.innerHTML = '';
            repositoriesDiv.innerHTML = '';
            paginationDiv.innerHTML = '';

            try {
                const userResponse = await fetch(`https://api.github.com/users/${username}`);
                const userData = await userResponse.json();

                if (userResponse.ok) {
                    const userInfo = document.createElement('div');
                    userInfo.className = 'mb-4';
                    userInfo.innerHTML = `
                        <img src="${userData.avatar_url}" alt="User Profile Image" class="img-fluid rounded-circle" style="max-width: 150px; max-height: 150px;" onclick="openUserProfile('${username}')">
                        <a href="${userData.html_url}" target="_blank" class="ms-2" onclick="openUserProfile('${username}')">${userData.login}</a>
                        
                        <div class="filter-dropdown">
                            <label for="reposPerPage" class="form-label">Repositories Per Page:</label>
                            <select class="form-select" id="reposPerPage" onchange="changeReposPerPage()">
                                <option value="10" ${reposPerPage === 10 ? 'selected' : ''}>10</option>
                                <option value="20" ${reposPerPage === 20 ? 'selected' : ''}>20</option>
                                <option value="30" ${reposPerPage === 30 ? 'selected' : ''}>30</option>
                                <option value="40" ${reposPerPage === 40 ? 'selected' : ''}>40</option>
                                <option value="50" ${reposPerPage === 50 ? 'selected' : ''}>50</option>
                                <option value="60" ${reposPerPage === 60 ? 'selected' : ''}>60</option>
                                <option value="70" ${reposPerPage === 70 ? 'selected' : ''}>70</option>
                                <option value="80" ${reposPerPage === 80 ? 'selected' : ''}>80</option>
                                <option value="90" ${reposPerPage === 90 ? 'selected' : ''}>90</option>
                                <option value="100" ${reposPerPage === 100 ? 'selected' : ''}>100</option>
                            </select>
                        </div>
                    `;
                    userInfoDiv.appendChild(userInfo);
                } else {
                    userInfoDiv.innerHTML = `<div class="alert alert-danger" role="alert">${userData.message}</div>`;
                    return;
                }

                const repositoriesResponse = await fetch(`https://api.github.com/users/${username}/repos?page=${currentPage}&per_page=${reposPerPage}`);
                const repositoriesData = await repositoriesResponse.json();

                if (repositoriesResponse.ok) {
                    repositoriesData.forEach(repo => {
                        const repoCard = document.createElement('div');
                        repoCard.className = 'repo-card';
                        repoCard.innerHTML = `
                            <h5><a href="${repo.html_url}" target="_blank">${repo.name}</a></h5>
                            <p>${repo.description || 'No description available'}</p>
                            <p>Language: ${repo.language || 'Not specified'}</p>
                        `;
                        repositoriesDiv.appendChild(repoCard);
                    });

                    const linkHeader = repositoriesResponse.headers.get('Link');
                    if (linkHeader) {
                        const links = parseLinkHeader(linkHeader);
                        const hasNextPage = links.next !== undefined;
                        const hasPrevPage = links.prev !== undefined;

                        totalPages = links.last ? getPageNumber(links.last) : totalPages;

                        const pagination = document.createElement('nav');
                        pagination.innerHTML = `
                            <ul class="pagination">
                                <li class="page-item ${!hasPrevPage ? 'disabled' : ''}">
                                    <a class="page-link" href="#" onclick="${hasPrevPage ? `changePage(${currentPage - 1})` : ''}">Previous</a>
                                </li>
                                <li class="page-item disabled">
                                    <span class="page-link">${currentPage} of ${totalPages}</span>
                                </li>
                                <li class="page-item ${!hasNextPage ? 'disabled' : ''}">
                                    <a class="page-link" href="#" onclick="${hasNextPage ? `changePage(${currentPage + 1})` : ''}">Next</a>
                                </li>
                            </ul>
                        `;
                        paginationDiv.appendChild(pagination);
                    }
                } else {
                    repositoriesDiv.innerHTML = `<div class="alert alert-danger" role="alert">${repositoriesData.message}</div>`;
                }
            } catch (error) {
                repositoriesDiv.innerHTML = `<div class="alert alert-danger" role="alert">Error fetching data from GitHub API</div>`;
            }
        }

        function openUserProfile(username) {
            window.location.href = `/${username}`;
        }

        function changePage(newPage) {
            if (newPage >= 1 && newPage <= totalPages) {
                currentPage = newPage;
                getRepositories();
            }
        }

        function parseLinkHeader(header) {
            const linkHeader = {};
            const parts = header.split(',');

            parts.forEach(part => {
                const section = part.split(';');
                if (section.length !== 2) return;
                const url = section[0].replace(/<(.*)>/, '$1').trim();
                const name = section[1].replace(/rel="(.*)"/, '$1').trim();
                linkHeader[name] = url;
            });

            return linkHeader;
        }

        function getPageNumber(url) {
            const match = url.match(/page=(\d+)&per_page=\d+$/);
            return match ? parseInt(match[1]) : 1;
        }

        function changeReposPerPage() {
            reposPerPage = parseInt(document.getElementById('reposPerPage').value);
            getRepositories();
        }