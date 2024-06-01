import config from '../config.js';

// https://rapidapi.com/omarmhaimdat/api/youtube-v2/pricing
function debounce(callback, delay) {
  let timeoutId;
  return async (...args) => {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      await callback(...args);
    }, delay);
  };
}

class App {
  input = document.querySelector('.search-input');
  result = document.querySelector('.search-result');
  videoGrid = document.querySelector('.videos');
  placeholder = 'Search the video';
  delay = 2000;
  debounceCall;
  controller;

  init = () => {
    this.debounceCall = debounce(this.sendApiReq.bind(this), this.delay);
    this.input.addEventListener('focus', (event) => {
      this.input.placeholder = '';
    });

    this.input.addEventListener('blur', (event) => {
      if (!this.input.value.trim()) {
        this.input.placeholder = this.placeholder;
      }
    });

    this.input.addEventListener('input', (event) => {
      let searchStr = event.target.value.trim();
      if (searchStr && searchStr.length > 3) {
        this.addLoaders();
        this.debounceCall(searchStr);
      } else {
        this.abortIfNeeded();
        this.videoGrid.innerHTML = '';
      }
    });
  };

  addLoaders() {
    for (let i = 0; i < 10; i++) {
      const el = document.createElement('div');
      el.classList.add('video');
      el.classList.add('loading');
      this.videoGrid.append(el);
    }
  }

  async sendApiReq(searchStr) {
    this.abortIfNeeded();
    this.controller = new AbortController();
    const url = new URL(config.apiUrl);
    url.searchParams.append('query', searchStr);
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': config.key,
        'X-RapidAPI-Host': config.host,
      },
      signal: this.controller.signal,
    };
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const data = await response.json();
      const videos = data.videos;
      console.log(videos);
      this.clearVideoGrid();
      this.buildVideoGrid(videos);
    } catch (error) {
      console.log(error.message);
      this.clearVideoGrid();
    }
  }

  buildVideoGrid = (videos) => {
    videos.forEach((video) => {
      const videoElment = this.videoTemplate(video);
      this.videoGrid.insertAdjacentHTML('beforeend', videoElment);
    });
  };

  abortIfNeeded = () => {
    if (this.controller) this.controller.abort();
  };

  clearVideoGrid = () => {
    this.videoGrid.innerHTML = '';
  };

  videoTemplate = ({ video_id, title, author, number_of_views }) => {
    return `
      <a href="https://www.youtube.com/watch?v=${video_id}&ab_channel=${author}" class="video">
        <div class="video__img">
          <img src="http://img.youtube.com/vi/${video_id}/0.jpg" alt="">
        </div>
        <div class="video__info">
          <div class="info__title">${title}</div>
          <div class="info__channel">${author}</div>
          <div class="info__views">${number_of_views} views</div>
        </div>
      </a>
    `;
  };
}

const app = new App();
document.addEventListener('DOMContentLoaded', app.init);
