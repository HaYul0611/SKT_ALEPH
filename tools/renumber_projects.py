import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

parts = content.split('<!-- 02. Fastival-management')
first_part = parts[0] + '<!-- 02. Fastival-management'
second_part = parts[1]

num_mappings = [
    ('<!-- 02. WeddingPlatform', '<!-- 03. WeddingPlatform'),
    ('<!-- 03. Simple-Commerce', '<!-- 04. Simple-Commerce'),
    ('<!-- 04. Linux-Bash', '<!-- 05. Linux-Bash'),
    ('<!-- 05. Network-Analysis', '<!-- 06. Network-Analysis'),
    ('<!-- 06. Cryptography', '<!-- 07. Cryptography'),
    ('<!-- 07. System-Security', '<!-- 08. System-Security'),
    ('<!-- 08. Web-Security', '<!-- 09. Web-Security'),
]

for old, new in num_mappings:
    second_part = second_part.replace(old, new, 1)

# Renumber <span class="project-num" aria-hidden="true">XX</span>
# In second part, we have 02, 03, 04, 05, 06, 07, 08 that need to become 03, 04, 05, 06, 07, 08, 09
numbers = ['08', '07', '06', '05', '04', '03', '02']
new_nums = ['09', '08', '07', '06', '05', '04', '03']

for old_n, new_n in zip(numbers, new_nums):
    target = f'<span class="project-num" aria-hidden="true">{old_n}</span>'
    replacement = f'<span class="project-num" aria-hidden="true">{new_n}</span>'
    second_part = second_part.replace(target, replacement, 1)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(first_part + second_part)

print("Renumbering complete!")
