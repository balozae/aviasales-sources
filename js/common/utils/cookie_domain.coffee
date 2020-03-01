current_domain = window.location.hostname
all_domain = current_domain.split('.').slice(-2).join('.')
if all_domain is current_domain
  all_domain = undefined
else
  all_domain = '.' + all_domain

module.exports = all_domain
