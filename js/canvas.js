function canvasInit() {
  const select = {
    id(id) {
      return document.getElementById(id)
    },
    el(el) {
      return document.querySelector(el)
    },
    allEl(type) {
      return document.querySelectorAll(type)
    },
  }

  const show = select.id('show')

  function start() {
    /** @type {HTMLCanvasElement} */
    const c = select.id('canvas')
    // /** @type {cRenderingContext2D} */
    const ctx = c.getContext('2d')
    let container = c.parentElement
    let ww = container.clientWidth,
      wh = container.clientHeight
    c.width = ww
    c.height = wh
    let stars = []
    let hue = 0

    //Resize
    window.addEventListener('resize', () => {
      c.width = ww = container.clientWidth
      c.height = wh = container.clientHeight
      init(50)
      drawStar(stars, 0)
    })

    //Handle Mouse
    const mouse = {
      x: undefined,
      y: undefined,
      r: 150,
      pressed: false,
      mouseIn: false,
      past: NaN,
    }
    function mouseEvents() {
      c.addEventListener('mouseenter', () => {
        mouse.mouseIn = true
      })
      c.addEventListener('mouseleave', () => {
        mouse.mouseIn = false
      })
      c.addEventListener('mousemove', function (e) {
        mouse.x = e.x
        mouse.y = e.y
        const test = showInfo.bind(stars)
        test()
      })
      c.addEventListener('click', (e) => {
        mouse.past = NaN
        mouse.pressed = false
        const test = showInfo.bind(stars)
        test()
        // setTimeout(() => {
        //   mouse.pressed = false
        // }, 100)
      })
      c.addEventListener('mousedown', () => {
        mouse.past = Date.now()
        mouse.pressed = true
      })
      // c.addEventListener('mouseup', () => {
      //   // mouse.past = NaN
      //   // mouse.pressed = false
      // })
    }
    mouseEvents()
    //Class
    class Star {
      constructor(x, y, r, g, s, incR, mx, my) {
        this.x = x
        this.y = y
        this.r = r
        this.grow = true
        this.g = g
        this.s = s
        this.incR = incR
        this.movement = {
          x: mx,
          y: my,
        }
        this.color = '#ffffff'
      }

      testUpdate(hue) {
        const clr = `hsl(${hue}, 70% , 50%)`
        this.color = clr
      }

      update() {
        if (this.r > this.g) {
          this.grow = false
        }
        if (this.r < this.s) {
          this.grow = true
        }

        if (this.grow) {
          this.r += this.incR
        } else {
          this.r += -1 * this.incR
        }
      }

      move() {
        this.x += this.movement.x
        this.y += this.movement.y
      }

      draw(context) {
        context.beginPath()
        context.fillStyle = this.color
        context.arc(this.x, this.y, this.r, 0, Math.PI * 2)
        context.fill()
        context.closePath()
      }
    }
    async function showInfo() {
      this.forEach((star) => {
        if (
          mouse.pressed &&
          mouse.x <= star.x + star.r &&
          mouse.x >= star.x - star.r &&
          mouse.y <= star.y + star.r &&
          mouse.y >= star.y - star.r
        ) {
          let str = ''
          for (let [key, val] of Object.entries(star)) {
            val = typeof val === 'object' ? JSON.stringify(val) : val
            str += `${key}: ${val}\n`
          }
          show.textContent = str
        }
      })
    }

    function randBetween(range1, range2) {
      if (typeof range1 !== 'number' && typeof range2 !== 'number') {
        return
      }
      return Math.random() * (range1 - range2) + range2
    }

    function init(n = 50) {
      if (stars.length !== 0) {
        stars = []
      }
      for (let i = 0; i < n; i++) {
        let x = randBetween(0, c.width),
          y = randBetween(0, c.height),
          r = randBetween(5, 10),
          g = randBetween(r, r * 2),
          s = randBetween(1, r / 2),
          incR = randBetween(0.1, 0.3),
          mx =
            Math.random() > 0.5
              ? randBetween(0.2, 1.5)
              : randBetween(-0.2, -1.5),
          my =
            Math.random() > 0.5
              ? randBetween(0.2, 1.5)
              : randBetween(-0.2, -1.5)

        stars.push(new Star(x, y, r, g, s, incR, mx, my))
      }
    }
    init(50)

    //unused
    function constellation(i, color = '#ffffff', d = 50) {
      for (let j = i; j < stars.length; j++) {
        const cur = stars[i],
          other = stars[j]
        const dx = cur.x - other.x
        const dy = cur.y - other.y
        const distance = Math.hypot(dx, dy)
        if (distance < d) {
          ctx.lineWidth = 2
          ctx.strokeStyle = color
          ctx.beginPath()
          ctx.moveTo(cur.x, cur.y)
          ctx.lineTo(other.x, other.y)
          ctx.stroke()
        }
      }
    }

    function gradientConstellation(i, d = 500) {
      const stars = this
      const cur = stars[i],
        cx = cur.x,
        cy = cur.y
      for (let j = i; j < stars.length; j++) {
        const other = stars[j]
        const dx = cx - other.x
        const dy = cy - other.y
        const distance = Math.hypot(dx, dy)
        if (distance < d) {
          const gradient = ctx.createLinearGradient(
            cur.x,
            cur.y,
            other.x,
            other.y
          )
          // Add two color stops
          gradient.addColorStop(0, cur.color)
          gradient.addColorStop(1, other.color)

          ctx.lineWidth = 2
          ctx.strokeStyle = gradient
          ctx.beginPath()
          ctx.moveTo(cur.x, cur.y)
          ctx.lineTo(other.x, other.y)
          ctx.stroke()
        }
      }
    }

    function mConstellation(context, clr, star) {
      if (!mouse.mouseIn) return
      const dx = mouse.x - star.x,
        dy = mouse.y - star.y
      const dist = Math.hypot(dx, dy)
      if (dist < 100) {
        context.strokeStyle = clr
        context.lineWidth = 3
        context.beginPath()
        context.moveTo(mouse.x, mouse.y)
        context.lineTo(star.x, star.y)
        context.stroke()
        context.closePath()
      }
    }

    function basicCollision() {
      //Predictable
      //For X AXIS
      // if (this.x - this.r - Math.abs(this.movement.x) <= 0) {
      //   this.movement.x = Math.abs(this.movement.x)
      // } else if (this.x + this.r + Math.abs(this.movement.x) >= c.width) {
      //   this.movement.x = -1 * Math.abs(this.movement.x)
      // }

      // //FOR Y AXIS
      // if (this.y - this.r - Math.abs(this.movement.y) <= 0) {
      //   this.movement.y = Math.abs(this.movement.y)
      // } else if (this.y + this.r + Math.abs(this.movement.y) >= c.height) {
      //   this.movement.y = -1 * Math.abs(this.movement.y)
      // }

      //Unpredictable
      //For X AXIS
      if (this.x - this.r - Math.abs(this.movement.x) <= 0) {
        this.movement.x = randBetween(0.2, 1.5)
      } else if (this.x + this.r + Math.abs(this.movement.x) >= c.width) {
        this.movement.x = randBetween(-0.2, -1.5)
      }

      //FOR Y AXIS
      if (this.y - this.r - Math.abs(this.movement.y) <= 0) {
        this.movement.y = randBetween(0.2, 1.5)
      } else if (this.y + this.r + Math.abs(this.movement.y) >= c.height) {
        this.movement.y = randBetween(-0.2, -1.5)
      }
    }

    // draw
    let t
    const drawStar = (arr, hu) => {
      arr.forEach((star, idx) => {
        let dist, dx, dy

        //Constellation on mouse
        // if (mouse.mouseIn) {
        //   dx = mouse.x - star.x
        //   dy = mouse.y - star.y
        //   dist = Math.hypot(dx, dy)
        //   const a = dist <= 100 ? mConstellation(ctx, star.color, star) : 1
        // }

        //stop on mouse click

        if (Date.now() - mouse.past > 500 && mouse.pressed && dist <= 500) {
          star.x += dx * 0.05
          star.y += dy * 0.05
          t = Date.now()
        } else if (Date.now() - t < 300 && dist <= 200) {
          //a nice effect that I like
          // star.x -= randBetween(-2, 2)
          // star.y -= randBetween(-2, 2)

          star.x -= dx * 0.5
          star.y -= dy * 0.5
        } else {
          star.testUpdate(hu)
          mConstellation(ctx, star.color, star)
          star.update()

          const collision = basicCollision.bind(star)
          collision()
          star.move()

          //Do this if you want normal Constellation effect
          // constellation(idx, hu)

          //Gradient Constellation
          const gc = gradientConstellation.bind(stars, idx, 100)
          gc()
        }

        star.draw(ctx)
        hu += idx
      })
    }

    function animate() {
      requestAnimationFrame(animate)
      ctx.clearRect(0, 0, c.width, c.height)
      drawStar(stars, hue)
      hue += 0.5
    }
    animate()
  }
  start()
}
export default canvasInit
