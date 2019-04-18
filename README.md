# Ceicom Media Player
Media player para os projetos da Ceicom

### 1ª passo
Coloque o seguinte html onde você quer usar o player

```html
<div class="cmp-player">
    <button type="button" class="btn play-btn"></button>
    <div class="progress-bar-wrapper">
        <div class="progress-bar"></div>
    </div>
    <div class="volume-wrapper">
        <div class="volume-action-wrapper">
            <input type="range" name="points" min="0" max="10" value="10" orient="vertical" class="volume-input">
        </div>
    </div>
    <div class="time">00:00 / 00:00</div>
</div>

<div class="cml-music-list-wrapper">
    <ul class="cml-music-list"></ul>
</div>
```

### 2ª passo
Coloque o css e js do plugin

```html
<link rel="stylesheet" href="caminho-para-o-arquivo/cmp.css">
<script src="caminho-para-o-arquivo/cmp.js"></script>
```

### 3ª passo
Execute o script

```js

// Player de Aúdio
new CeicomMediaPlayer(data);

// Lista das músicas que estão sendo tocadas
// Obs: A inicialização desse "plugin" não é necessario para o funcionamento do player
// ele apenas mostras uma lista com as músicas e a que está sendo tocada
new CeicomMediaList(data);
```
**Tanto o player quanto a lista do player precisam receber o unico parâmetro de data
para seu funcionamento**

### Extras:
Existe algumas funções no player

```js
// Player de Aúdio
const player = new CeicomMediaPlayer(data);

// pega o volume atual do player
player.getVolume();

// altera o volume atual do player
player.setVolume(0.5);
```