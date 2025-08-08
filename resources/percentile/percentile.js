const driverData = {
  B0: 0, B1: 0, B2: 294, B3: 4008,
  S1: 735, S2: 30, S3: 6,
  G1: 1, G2: 1, G3: 1,
  P1: 0, P2: 0, P3: 0
}

const safetyData = {
  B0: 1692, B1: 520, B2: 350, B3: 293,
  S1: 407, S2: 350, S3: 245,
  G1: 249, G2: 195, G3: 135,
  P1: 205, P2: 114, P3: 321
}

const rankOrder = ["B0","B1","B2","B3","S1","S2","S3","G1","G2","G3","P1","P2","P3"]

function initDropdown(id, data, callback, imgPrefix, initialRank) {
  const dropdown = document.getElementById(id)
  const selected = dropdown.querySelector('.selected')
  const list = dropdown.querySelector('.dropdown-list')

  // Clear previous if any
  list.innerHTML = ''

  // Populate dropdown
  rankOrder.forEach(rank => {
    const item = document.createElement('div')
    const img = document.createElement('img')
    img.src = `../../assets/${imgPrefix}${rank}.png`
    img.alt = rank
    item.appendChild(img)
    item.addEventListener('click', () => {
      selected.innerHTML = ''
      selected.appendChild(img.cloneNode(true))
      list.style.display = 'none'
      callback(rank)
    })
    list.appendChild(item)
  })

  // Set initial selected image
  const initialImg = document.createElement('img')
  initialImg.src = `../../assets/${imgPrefix}${initialRank}.png`
  initialImg.alt = initialRank
  selected.innerHTML = ''
  selected.appendChild(initialImg)

  // Call callback initially with initialRank
  callback(initialRank)

  // Toggle dropdown on selected click
  selected.addEventListener('click', () => {
    list.style.display = list.style.display === 'block' ? 'none' : 'block'
  })

  // Close dropdown clicking outside
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) {
      list.style.display = 'none'
    }
  })
}

function calculatePercentile(rank, data) {
  const total = Object.values(data).reduce((a, b) => a + b, 0)
  let better = 0
  for (const key of rankOrder) {
    if (key === rank) break
    better += data[key]
  }
  return ((total - better) / total * 100).toFixed(2)
}

document.addEventListener('DOMContentLoaded', () => {
  initDropdown('driver-dropdown', driverData, (rank) => {
    const pct = calculatePercentile(rank, driverData)
    document.getElementById('driver-percentile').textContent = `Percentile: ${pct}%`
  }, 'DR', 'B3')

  initDropdown('safety-dropdown', safetyData, (rank) => {
    const pct = calculatePercentile(rank, safetyData)
    document.getElementById('safety-percentile').textContent = `Percentile: ${pct}%`
  }, 'SR', 'B0')
})