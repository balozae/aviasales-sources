/* eslint-disable */

// DFP:
// var googletag = window.googletag || {}
// googletag.cmd = googletag.cmd || []
// var Criteo = window.Criteo || {}
// Criteo.events = Criteo.events || []
var adUnits = { placements: [] };

var init = function(onBannerRender) {
  var slots = [];
  var divs = document.querySelectorAll('[data-slot]');
  var i;
  for (i = 0; i < divs.length; ++i) {
    slots.push(parseGoogleTag(divs[i]));
  }

  // Filter all fallback slots from initial load
  var fallbacks = [];
  slots.forEach(function(slot) {
    if (slot.fallback) {
      fallbacks.push(slot.fallback);
    }
    if (slot.zoneid) {
      adUnits.placements.push({
        slotid: slot.id,
        zoneid: Number(slot.zoneid),
      });
    }
  });
  slots = slots.filter(function(slot) {
    return fallbacks.indexOf(slot.id) === -1;
  });

  // Create tags only once, before setting page level GPT configs and Criteo
  googletag.cmd.push(function() {
    slots.forEach(function(slot) {
      createTag(slot, onBannerRender, false);
    });

    googletag.pubads().enableSingleRequest();
    googletag.pubads().disableInitialLoad();
    googletag.enableServices();

    // NOTE: if we have criteo slots on page, request bids, otherwise just render slots
    if (adUnits.placements && adUnits.placements.length > 0) {
      Criteo.events.push(function() {
        Criteo.SetLineItemRanges('0.01..9:0.01;9.05..99:0.05');
        Criteo.RequestBids(adUnits, launchAdServer, 800);
      });
    } else {
      googletag.pubads().refresh();
    }
  });
};

var launchAdServer = function() {
  googletag.cmd.push(function() {
    Criteo.SetDFPKeyValueTargeting();
    googletag.pubads().refresh();
  });
};

var isCriteo = function(slotId) {
  if (adUnits.placements.length === 0) {
    return;
  }
  var isCriteo = false;
  for (i = 0; i < adUnits.placements.length; i++) {
    if (adUnits.placements[i].slotid === slotId) {
      isCriteo = true;
    }
  }
  return isCriteo;
};

var createTag = function(params, onBannerRender, isFallback) {
  var slot = googletag
    .defineSlot(
      params.name,
      params.sizes.map(function(size) {
        return size[1];
      }),
      params.id,
    )
    .addService(googletag.pubads())
    .setCollapseEmptyDiv(true, true);

  if (params.sizes.length > 1) {
    var key;
    var mapping = googletag.sizeMapping();
    var groupSizes = {};
    params.sizes.forEach(function(s) {
      var windowSize = s[0],
        adSize = s[1];
      key = windowSize.join('x');
      if (!groupSizes[key]) {
        groupSizes[key] = [];
      }
      groupSizes[key].push(adSize);
    });
    var windowSize, adSizes;
    for (key in groupSizes) {
      if (groupSizes.hasOwnProperty(key)) {
        adSizes = groupSizes[key];
        windowSize = parseSizeX(key);
        mapping = mapping.addSize(windowSize, adSizes);
      }
    }
    slot.defineSizeMapping(mapping.build());
  }

  if (!params.targetingParams) {
    params.targetingParams = {};
  }
  if (!params.targetingParams['url']) {
    params.targetingParams['url'] = document.location.pathname;
  }
  for (var param in params.targetingParams) {
    if (params.targetingParams.hasOwnProperty(param)) {
      var value = params.targetingParams[param];
      if (value) {
        googletag.pubads().setTargeting(param, value);
      }
    }
  }

  googletag.cmd.push(function() {
    googletag.display(params.id);
  });

  if (onBannerRender) {
    googletag.cmd.push(function() {
      googletag.pubads().addEventListener('slotRenderEnded', function(event) {
        if (event.slot.getAdUnitPath() === params.name) {
          onBannerRender({
            isFallback,
            slotId: event.slot.getSlotElementId(),
            unitPath: event.slot.getAdUnitPath(),
            isEmpty: event.isEmpty,
          });
        }
      });
    });
  }

  if (params.fallback) {
    googletag.cmd.push(function() {
      googletag.pubads().addEventListener('slotRenderEnded', function(event) {
        var slotId = event.slot.getSlotElementId();
        var adUnitPath = event.slot.getAdUnitPath();
        if (event.isEmpty && adUnitPath === params.name) {
          var isCriteoSlot = isCriteo(slotId);
          console.info(
            'Fallback google tag ' +
              slotId +
              (isCriteoSlot ? '(criteo)' : '') +
              ' to ' +
              params.fallback +
              '.',
          );
          renderFallback(params.fallback, onBannerRender);
        }
      });
    });
  }

  return slot;
};

var renderFallback = function(fallback, onBannerRender) {
  var fallbackElement = document.querySelector('#' + fallback);
  var fallbackTypeExec, fallbackType0, fallbackType;
  fallbackTypeExec = /(div-gpt-ad)/gi.exec(fallback);
  if (fallbackTypeExec) {
    fallbackType0 = fallbackTypeExec[0];
    if (fallbackType0) {
      fallbackType = fallbackType0.replace('div-gpt-ad', 'googletag');
    }
  }
  switch (fallbackType) {
    case 'googletag':
      const slot = createTag(parseGoogleTag(fallbackElement), onBannerRender, true);
      googletag.pubads().refresh([slot]); // We need it as we called `disableInitialLoad()` before.
      break;
    default:
      console.log('we dont have fallback for id ' + fallback + ' and type ' + fallbackType);
      break;
  }
};

var parseSizeX = function(size) {
  return size.split('x').map(function(value) {
    return parseInt(value, 10);
  });
};

var parseGoogleTag = function(elem) {
  var targetingParams = {};
  var id = elem.getAttribute('id');
  var name = elem.getAttribute('data-slot');
  var fallback = elem.getAttribute('data-fallback');
  var elementZoneId = elem.getAttribute('data-zoneid');

  var criteoZoneId = '';
  //Choose zoneId for the main banner (below form)
  if (id === 'div-gpt-ad-1477979940582-0') {
    var width =
      window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    var zoneIds = JSON.parse(elementZoneId);
    if (width < 468) {
      criteoZoneId = zoneIds['320x50'];
    } else if (width >= 468 && width < 728) {
      criteoZoneId = zoneIds['468x60'];
    } else if (width >= 728 && width < 970) {
      criteoZoneId = zoneIds['728x90'];
    } else {
      criteoZoneId = zoneIds['970x90'];
    }
  } else {
    criteoZoneId = elementZoneId;
  }

  var sizes = (function() {
    var result = [];
    elem
      .getAttribute('data-size')
      .split(',')
      .forEach(function(sizeMapping) {
        var s = sizeMapping.split(':').map(parseSizeX);
        var windowSize = s[0],
          adSize = s[1];
        if (!adSize) {
          adSize = windowSize;
          windowSize = [0, 0];
        }
        result.push([windowSize, adSize]);
      });
    return result;
  })();

  try {
    targetingParams = JSON.parse(elem.getAttribute('data-targeting-params'));
  } catch (e) {
    console.error(e);
  }

  return {
    id: id,
    name: name,
    sizes: sizes,
    targetingParams: targetingParams,
    fallback: fallback,
    zoneid: criteoZoneId,
  };
};

/* eslint-enable */

export default init;
