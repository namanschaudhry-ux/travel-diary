(() => {
  const { city, asAt, cafes } = JSON.parse(document.getElementById('cafe-data').textContent);
  const esc = value => String(value).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const date = value => value ? new Date(value + 'T00:00:00').toLocaleDateString('en-AU', {day:'numeric',month:'short',year:'numeric'}) : 'Date unknown';
  const purchases = cafe => cafe.visits === null ? 'Visited · count unknown' : `${cafe.visits} recorded purchase${cafe.visits === 1 ? '' : 's'}`;
  const needsCheck = cafe => !cafe.locations.length || cafe.locations.some(pin => pin.status !== 'ok');
  const unplaced = cafes.filter(cafe => !cafe.locations.length).length;
  const manual = cafes.filter(cafe => cafe.visits === null).length;
  document.getElementById('tally').innerHTML = `<span><b>${cafes.length}</b>cafes</span><span><b>${cafes.reduce((sum,cafe) => sum + (cafe.visits ?? 0),0)}</b>purchases</span><span><b>${cafes.length - unplaced}</b>with pins</span><span><b>${unplaced}</b>not placed</span>`;
  document.querySelector('.sub').textContent = `All ${cafes.length} cafes in the ${city === 'melbourne' ? 'Melbourne' : 'New York'} Notion database, reconciled ${date(asAt)}. ${manual ? `${manual} confirmed visits have no purchase count or date. ` : ''}Cafe totals include every branch; pins do not assign purchases to individual branches.`;

  const melbourne = city === 'melbourne';
  const map = L.map('map', {zoomSnap:0.5,minZoom:melbourne ? 10 : 11,maxZoom:17});
  L.tileLayer(`/cafes/${city}/osm/{z}/{x}/{y}.png`, {
    minZoom:melbourne ? 10 : 11, maxNativeZoom:melbourne ? 13 : 14,maxZoom:17,
    bounds:melbourne ? [[-38.02,144.78],[-37.70,145.44]] : [[40.61,-74.05],[40.80,-73.91]],
    attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  if (!melbourne) L.tileLayer(`/cafes/${city}/osm/{z}/{x}/{y}.png`, {minZoom:15,maxNativeZoom:15,maxZoom:17,bounds:[[40.695,-74.02],[40.765,-73.94]]}).addTo(map);
  const markers = new Map();
  const allPoints = [];
  cafes.forEach(cafe => {
    const multiple = cafe.locations.length > 1;
    const entries = cafe.locations.map(pin => {
      allPoints.push([pin.lat,pin.lng]);
      const size = multiple || cafe.visits === null ? 15 : Math.round(9 + 4.4 * Math.sqrt(cafe.visits));
      const icon = L.divIcon({className:'',iconSize:[size,size],iconAnchor:[size/2,size/2],html:`<div class="pin ${pin.status}" style="width:${size}px;height:${size}px">${!multiple && cafe.visits > 2 ? cafe.visits : ''}</div>`});
      const location = `<p>${esc(pin.note || '')}</p><p class="meta" style="margin-top:6px">${multiple ? 'Branch location from the earlier map. Purchases above are the cafe total across all branches; allocation is unknown.' : pin.status !== 'ok' ? 'Location needs checking; this pin is not proof of the visited branch.' : ''}</p>`;
      const source = pin.source?.startsWith('https://') ? `<p class="meta"><a href="${esc(pin.source)}" target="_blank" rel="noopener">Location source: OpenStreetMap</a>${pin.venueSource ? ` · <a href="${esc(pin.venueSource)}" target="_blank" rel="noopener">Published venue address</a>` : ''}</p>` : '<p class="meta">Location retained from the earlier map; not reverified.</p>';
      return L.marker([pin.lat,pin.lng],{icon,title:multiple ? `${cafe.name}: ${pin.name}` : cafe.name,riseOnHover:true})
        .bindTooltip(`${esc(cafe.name)}${multiple ? ` · ${esc(pin.name)}` : ''}`)
        .bindPopup(`<div class="pop"><h3>${esc(cafe.name)}</h3><div class="meta">${purchases(cafe)} · ${date(cafe.last)}</div><p class="meta">Notion suburb: ${esc(cafe.area)}</p>${multiple ? `<p><b>${esc(pin.name)}</b></p>` : ''}${location}${source}</div>`).addTo(map);
    });
    markers.set(cafe.id,entries);
  });
  const fitAll = () => { if (allPoints.length) map.fitBounds(allPoints,{padding:[30,30]}); };
  fitAll();
  let filter = 'all', sort = 'visits', query = '';
  try { const saved = localStorage.getItem('cafe-sort'); if (['visits','last','name'].includes(saved)) sort=saved; } catch {}
  const comparators = {
    visits:(a,b) => (b.visits ?? -1)-(a.visits ?? -1) || (b.last ?? '').localeCompare(a.last ?? '') || a.name.localeCompare(b.name),
    last:(a,b) => (b.last ?? '').localeCompare(a.last ?? '') || a.name.localeCompare(b.name),
    name:(a,b) => a.name.localeCompare(b.name),
  };
  function render() {
    document.querySelectorAll('[data-f]').forEach(button => button.setAttribute('aria-pressed',button.dataset.f===filter));
    document.querySelectorAll('[data-s]').forEach(button => button.setAttribute('aria-pressed',button.dataset.s===sort));
    const selected = cafes.filter(cafe => (filter==='all' || needsCheck(cafe)) && `${cafe.name} ${cafe.area} ${cafe.locations.map(pin=>pin.area || '').join(' ')}`.toLowerCase().includes(query)).sort(comparators[sort]);
    const ids = new Set(selected.map(cafe=>cafe.id));
    markers.forEach((entries,id) => entries.forEach(marker => { if(ids.has(id) && !map.hasLayer(marker)) marker.addTo(map); else if(!ids.has(id) && map.hasLayer(marker)) map.removeLayer(marker); }));
    const row = cafe => `<${cafe.locations.length ? 'button type="button"' : 'div'} class="row" ${cafe.locations.length ? `data-id="${cafe.id}"` : ''}><span class="n">${cafe.visits ?? '?'}</span><span class="nm">${esc(cafe.name)}${!cafe.locations.length ? '<span class="chip check">Not placed</span>' : needsCheck(cafe) ? '<span class="chip check">Check location</span>' : ''}${cafe.visits===null ? '<span class="chip">Count unknown</span>' : ''}<span class="ar">${esc(cafe.area)}</span>${!cafe.locations.length ? `<span class="ar">${esc(cafe.reason)}</span>` : ''}</span><span class="dt">${date(cafe.last)}</span></${cafe.locations.length ? 'button' : 'div'}>`;
    const placed=selected.filter(cafe=>cafe.locations.length), missing=selected.filter(cafe=>!cafe.locations.length);
    document.getElementById('list').innerHTML = `<p class="result-count" role="status">${selected.length} of ${cafes.length} cafes</p>` + (selected.length ? placed.map(row).join('')+(missing.length ? '<div class="sect">Not placed · included in the totals</div>'+missing.map(row).join('') : '') : '<p class="foot">No cafes match your search.</p>') + `<p class="foot">Reconciled with Notion on ${date(asAt)}. Names, suburbs, purchase counts and dates match that database snapshot. “?” means visited with no count recorded. Each cafe counts once, even with several pins. Unknown locations remain in the list. This is a snapshot; later Notion edits require a refresh.</p>`;
  }
  document.getElementById('list').addEventListener('click',event => {
    const row=event.target.closest('[data-id]'); if(!row) return;
    const entries=markers.get(row.dataset.id); if(!entries?.length) return;
    if(entries.length>1) map.fitBounds(entries.map(marker=>marker.getLatLng()),{padding:[40,40],maxZoom:15});
    else map.setView(entries[0].getLatLng(),Math.max(map.getZoom(),14));
    entries[0].openPopup();
    if(matchMedia('(max-width:760px)').matches) document.querySelector('.mapwrap').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth'});
  });
  document.querySelectorAll('[data-f]').forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.f;render();}));
  document.querySelectorAll('[data-s]').forEach(button=>button.addEventListener('click',()=>{sort=button.dataset.s;try{localStorage.setItem('cafe-sort',sort);}catch{}render();}));
  document.getElementById('q').addEventListener('input',event=>{query=event.target.value.trim().toLowerCase();render();});
  render();
})();
