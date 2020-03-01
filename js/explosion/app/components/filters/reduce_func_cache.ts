/*
  т.к. пропозалы к билеты могут только добавлятся, но не удаляться или изменяться
  то можем сформировать ключ для кэширования вычисления boundaries фильтров
  как сигнатура билета и кол-во пропозалов в нём.

  REVIEW: возможно, стоило абстрагировать это кэширование от структуры тикета
  и названия фильтров, но кмк так более наглядно для понимания что здесь происходит.
*/

const cache = {}

const reduceFuncCache = (filterName, ticketData, fn) => {
  const [ticket, proposals] = ticketData
  const ticketCacheKey = `${ticket.sign}--${proposals.length}`

  if (!cache[filterName]) {
    cache[filterName] = {}
  }

  if (cache[filterName][ticketCacheKey]) {
    return cache[filterName][ticketCacheKey]
  }

  const result = fn()

  cache[filterName][ticketCacheKey] = result

  return result
}

export default reduceFuncCache
