p = r'C:/Users/MaxTh/OneDrive/Documenten/GitHub/Egodact_addon_extension/Egodact Smart/src/buttons.js'
s = open(p, encoding='utf-8').read()
old = '    if (\n        !window.location.href.includes(\n            "https://app.egodact.com/"\n        )\n    ) {'
new = '    if (false) {'
assert old in s, 'anchor not found'
s = s.replace(old, new)
out = r'C:/Users/MaxTh/OneDrive/Documenten/GitHub/Egodact_addon_extension/Egodact Smart/src/test_buttons.js'
open(out, 'w', encoding='utf-8').write(s)
print('done')
