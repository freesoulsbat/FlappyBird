function novoElemento(tagName, className){
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

function Barreira(reversa = false){
    this.elem = novoElemento('div', 'barreira')

    const borda = novoElemento('div','borda')
    const corpo = novoElemento('div','corpo')
    this.elem.appendChild( reversa ? corpo : borda)
    this.elem.appendChild( reversa ? borda : corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px`
}

// const b = new Barreira(true)
// b.setAltura(300)
// document.querySelector('[wm-flappy]').appendChild(b.elem)

function ParDeBarreiras(altura, abertura, x) {
    this.elem = novoElemento('div', 'par-de-barreiras')

    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)

    this.elem.appendChild(this.superior.elem)
    this.elem.appendChild(this.inferior.elem)

    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }

    this.getX = () => parseInt(this.elem.style.left.split('px')[0])
    this.setX = x => this.elem.style.left = `${x}px`
    this.getLargura = () => this.elem.clientWidth

    this.sortearAbertura()
    this.setX(x)
}

// const b = new ParDeBarreiras(700, 200, 800)
// document.querySelector('[wm-flappy]').appendChild(b.elem)

function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3)
    ]


    const deslocamento = 3 
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            if (par.getX() < -par.getLargura()) {
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura()
            }
            const meio = largura / 2 
            const cruzouOMeio = par.getX() + deslocamento >= meio 
            && par.getX() < meio 
            if(cruzouOMeio) notificarPonto()
        })
    }
}

function Passaro(alturaJogo) {
    let voando = false 

    this.elem = novoElemento('img', 'passaro')
    this.elem.src = 'imgs/passaro.png'

    this.getY = () => parseInt(this.elem.style.bottom.split('px')[0])
    this.setY = y => this.elem.style.bottom = `${y}px`

    window.onkeydown = e => voando = true 
    window.onkeyup = e => voando = false

    this.animar = () => {
        const novoY = this.getY() + (voando ? 8 : -5)
        const alturaMaxima = alturaJogo - this.elem.clientHeight

        if (novoY <= 0) {
            this.setY(0)
        } else if (novoY >= alturaMaxima) {
            this.setY(alturaMaxima)
        } else {
            this.setY(novoY)
        }
    }

    this.setY(alturaJogo / 2)
}

function Progresso() {
    this.elem = novoElemento('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.elem.innerHTML = pontos
    }
    this.atualizarPontos(0)
}

// const barreiras = new Barreiras(700, 1200, 200, 400)
// const passaro = new Passaro(700)
// const progresso = new Progresso()
// const areaDoJogo = document.querySelector('[wm-flappy]')

// areaDoJogo.appendChild(passaro.elem)
// areaDoJogo.appendChild(progresso.elem)
// barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elem))
// setInterval(() => {
//     barreiras.animar()
//     passaro.animar()
// }, 20)

function estaoSobrepostos(elemA, elemB) {
    const a = elemA.getBoundingClientRect()
    const b = elemB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top
    return horizontal && vertical
}

function colidiu(passaro, barreiras) {
    let colidiu = false
    barreiras.pares.forEach(parDeBarreiras => {
        if (!colidiu) {
            const superior = parDeBarreiras.superior.elem
            const inferior = parDeBarreiras.inferior.elem
            colidiu = estaoSobrepostos(passaro.elem, superior) || estaoSobrepostos(passaro.elem, inferior)
        }
    })
    return colidiu
}

function Pause() {
    this.elem = novoElemento('a', 'botoes')
    const areaDoJogo = document.querySelector('[wm-flappy]')
    const botao = this.elem

    this.elem.innerHTML = 'Restart?'
    areaDoJogo.appendChild(this.elem)

    botao.onclick = () => window.location.reload()
}

function FlappyBird() {
    let pontos = 0

    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth

    const progresso = new Progresso()
    const barreiras = new Barreiras(altura, largura, 200, 400, () => progresso.atualizarPontos(++pontos))
    const passaro = new Passaro(altura)

    areaDoJogo.appendChild(progresso.elem)
    areaDoJogo.appendChild(passaro.elem)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elem))

    this.start = () => {
        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()

            if(colidiu(passaro,barreiras)) {
                clearInterval(temporizador)
                Pause()
            }
        }, 20)
    }
}

new FlappyBird().start()