#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PMP Markdown to CSV - Complete Rewrite
Simple, robust, tested version
"""

import re
import csv
from pathlib import Path


def preprocess_markdown(content):
    """Preprocess markdown to ensure keywords are at start of lines.
    
    Ensures that:
    - "Correct Answer: X" or "Answer: X"
    - "Explanation:"
    - "Hint:"
    
    are always at the beginning of lines. If found in the middle of text,
    move them to a new line.
    """
    
    # Pattern 1: Move "Correct Answer: X" to new line if not at start
    # Look for text followed by "Correct Answer:" and add newline before it
    content = re.sub(
        r'([^\n])\s+(Correct\s+Answer\s*:\s*[A-D])',
        r'\1\n\2',
        content,
        flags=re.IGNORECASE
    )
    
    # Pattern 1b: Move "Answer: X" to new line if not at start (and not "Answer A", "Answer B", etc)
    # This catches "Answer: C" format
    content = re.sub(
        r'([^\n])\s+(Answer\s*:\s*[A-D])(?!\w)',
        r'\1\n\2',
        content,
        flags=re.IGNORECASE
    )
    
    # Pattern 1c: Normalize "Correct\\nAnswer: X" (or "Correct   \\n  Answer: X")
    # -> "Correct Answer: X"
    # Some exports split "Correct Answer" across lines.
    content = re.sub(
        r'Correct[ \t]*\n[ \t]*Answer\s*:\s*([A-D])',
        r'Correct Answer: \1',
        content,
        flags=re.IGNORECASE
    )
    
    # Pattern 2: Move "Explanation:" to new line if not at start
    content = re.sub(
        r'([^\n])\s+(Explanation\s*:)',
        r'\1\n\2',
        content,
        flags=re.IGNORECASE
    )
    
    # Pattern 3: Move "Hint:" to new line if not at start
    content = re.sub(
        r'([^\n])\s+(Hint\s*:)',
        r'\1\n\2',
        content,
        flags=re.IGNORECASE
    )
    
    # Pattern 4: Move "Question answered incorrectly/correctly" to new line if not at start
    content = re.sub(
        r'([^\n])\s+(Question\s+answered\s+(?:incorrectly|correctly))',
        r'\1\n\2',
        content,
        flags=re.IGNORECASE
    )
    
    # Pattern 5: Fix malformed answer prefixes like
    # "AError! Not a valid embedded object.<answer text>" -> "A <answer text>"
    # (observed in some exported markdown files)
    content = re.sub(
        r'\b([ABCD])Error!\s+Not\s+a\s+valid\s+embedded\s+object\.\s*',
        r'\1 ',
        content,
        flags=re.IGNORECASE
    )
    
    return content


def main(md_file, output_dir="csv"):
    """Main conversion
    
    Args:
        md_file (str): Đường dẫn file markdown
        output_dir (str): Thư mục output (mặc định: csv)
    """
    
    print("\n" + "=" * 70)
    print("🎯 PMP MD → CSV Converter")
    print("=" * 70 + "\n")
    
    md_path = Path(md_file)
    
    # Check file exists
    if not md_path.exists():
        print(f"❌ File not found: {md_file}")
        return False
    
    # Tạo thư mục output nếu chưa tồn tại
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Tên file CSV output
    csv_file = str(output_path / f"{md_path.stem}.csv")
    
    print(f"📖 Reading: {md_file}")
    
    with open(str(md_path), 'r', encoding='utf-8') as f:
        content = f.read()
    
    print(f"✓ File size: {len(content):,} bytes\n")
    
    # ===== PREPROCESSING: Normalize keywords to be at start of lines =====
    print("🔧 Preprocessing markdown...")
    content = preprocess_markdown(content)
    print("✓ Preprocessing complete\n")
    
    # Extract questions
    questions = []
    
    # Split by "Question X"
    parts = re.split(r'Question\s+(\d+)', content)
    
    print(f"Split into {len(parts)} parts\n")
    
    # parts[0] = prefix before Question 1
    # parts[1] = "1"
    # parts[2] = content of Q1
    # parts[3] = "2"
    # parts[4] = content of Q2
    # ... etc
    
    for i in range(1, len(parts), 2):
        if i + 1 >= len(parts):
            break
        
        q_num = parts[i].strip()
        q_content = parts[i + 1]
        
        # Parse this question
        q_data = parse_question(q_num, q_content)
        
        if q_data and q_data.get('Question'):
            questions.append(q_data)
            print(f"✓ Q{q_num}: {(q_data['Question'][:40] + '...')[:43]}")
    
    print(f"\n✅ Extracted {len(questions)} questions\n")
    
    if not questions:
        print("❌ No questions were extracted!")
        return False
    
    # Save to CSV
    print("💾 Saving to CSV...")
    save_to_csv(questions, csv_file)
    
    # Show first question
    print("\n📊 Sample (First Question):")
    print("─" * 70)
    q = questions[0]
    print(f"No: {q['No']}")
    print(f"Q:  {q['Question'][:80]}")
    print(f"A:  {q['Answer A'][:70] if q['Answer A'] else '(empty)'}")
    print(f"B:  {q['Answer B'][:70] if q['Answer B'] else '(empty)'}")
    print(f"C:  {q['Answer C'][:70] if q['Answer C'] else '(empty)'}")
    print(f"D:  {q['Answer D'][:70] if q['Answer D'] else '(empty)'}")
    print(f"✓:  {q['Correct Answer']}")
    
    print("\n" + "=" * 70)
    print("✨ Done!")
    print("=" * 70 + "\n")
    
    return True


def parse_question(q_num, content):
    """Parse a single question with format:
    
    <question text (can start with A_)>
    A <answer A text>
    B <answer B text>
    C <answer C text>
    D <answer D text>
    Correct Answer: X
    Hint: <optional>
    Explanation: <text, can be multiline>
    Details for Each Option: (skip)
    Reference: (skip)
    """
    
    data = {
        'No': q_num,
        'Question': '',
        'Answer A': '',
        'Answer B': '',
        'Answer C': '',
        'Answer D': '',
        'Correct Answer': '',
        'Explanation': ''
    }
    
    lines = content.split('\n')
    
    # ===== FIND ANSWER SECTION START =====
    # Prefer locating A/B/C/D by scanning backward from "Question answered ...".
    # This avoids false matches when question stem starts with "A ...".
    answer_a_idx = -1
    answer_b_idx = -1
    answer_c_idx = -1
    answer_d_idx = -1
    
    answered_idx = -1
    for idx, line in enumerate(lines):
        if re.match(r'^Question\s+answered', line.strip(), re.IGNORECASE):
            answered_idx = idx
            break
    
    if answered_idx >= 0:
        # Find D, C, B, A in reverse order before "Question answered ..."
        for idx in range(answered_idx - 1, -1, -1):
            if re.match(r'^D\s+', lines[idx].strip()):
                answer_d_idx = idx
                break
        if answer_d_idx >= 0:
            for idx in range(answer_d_idx - 1, -1, -1):
                if re.match(r'^C\s+', lines[idx].strip()):
                    answer_c_idx = idx
                    break
        if answer_c_idx >= 0:
            for idx in range(answer_c_idx - 1, -1, -1):
                if re.match(r'^B\s+', lines[idx].strip()):
                    answer_b_idx = idx
                    break
        if answer_b_idx >= 0:
            for idx in range(answer_b_idx - 1, -1, -1):
                if re.match(r'^A\s+', lines[idx].strip()):
                    answer_a_idx = idx
                    break
    
    # Fallback if "Question answered ..." marker is missing
    if answer_d_idx < 0:
        for idx, line in enumerate(lines):
            line_stripped = line.strip()
            if answer_a_idx == -1 and re.match(r'^A\s+', line_stripped):
                answer_a_idx = idx
            elif answer_a_idx != -1 and answer_b_idx == -1 and re.match(r'^B\s+', line_stripped):
                answer_b_idx = idx
            elif answer_b_idx != -1 and answer_c_idx == -1 and re.match(r'^C\s+', line_stripped):
                answer_c_idx = idx
            elif answer_c_idx != -1 and answer_d_idx == -1 and re.match(r'^D\s+', line_stripped):
                answer_d_idx = idx
                # Found all four answers, we're done searching
                break
    
    # Verify we found all 4 answers
    # If not found in line-based mode, try inline format:
    # "... ? A <ansA> B <ansB> C <ansC> D <ansD> Question answered ..."
    if answer_d_idx < 0:
        inline_match = re.search(
            r'(?:\?\s+|:\s+|Top\s+of\s+Form\s+)A\s+(.+?)\s+B\s+(.+?)\s+C\s+(.+?)\s+D\s+(.+?)(?=\s+Question\s+answered|\s+Hint\s*:|\s+Correct\s+Answer\s*:|\s+Answer\s*:\s*[A-D]|$)',
            content,
            flags=re.IGNORECASE | re.DOTALL
        )
        if inline_match:
            # ===== EXTRACT QUESTION TEXT (inline mode) =====
            q_text_raw = content[:inline_match.start()]
            q_text_raw = re.sub(r'^.*?Question\s+ID\s*:\s*\d+\s*', '', q_text_raw, flags=re.IGNORECASE | re.DOTALL)
            q_text_raw = re.sub(r'\bTop\s+of\s+Form\b', ' ', q_text_raw, flags=re.IGNORECASE)
            q_text_raw = re.sub(r'\s+', ' ', q_text_raw).strip()
            if not q_text_raw:
                q_text_raw = re.sub(r'^.*?Question\s+ID\s*:\s*\d+\s*', '', content, flags=re.IGNORECASE | re.DOTALL)
                q_text_raw = re.sub(r'\s+A\s+.*$', '', q_text_raw, flags=re.IGNORECASE | re.DOTALL)
                q_text_raw = re.sub(r'\bTop\s+of\s+Form\b', ' ', q_text_raw, flags=re.IGNORECASE)
                q_text_raw = re.sub(r'\s+', ' ', q_text_raw).strip()
            data['Question'] = q_text_raw
            
            data['Answer A'] = re.sub(r'\s+', ' ', inline_match.group(1)).strip()
            data['Answer B'] = re.sub(r'\s+', ' ', inline_match.group(2)).strip()
            data['Answer C'] = re.sub(r'\s+', ' ', inline_match.group(3)).strip()
            data['Answer D'] = re.sub(r'\s+', ' ', inline_match.group(4)).strip()
        else:
            return data  # No complete question structure found
    
    # ===== EXTRACT QUESTION TEXT =====
    if answer_d_idx >= 0:
        # Find "Question ID:" line to start from there
        q_start_idx = 0
        for idx, line in enumerate(lines[0:answer_a_idx]):
            if re.match(r'^Question\s+ID\s*:', line.strip(), re.IGNORECASE):
                q_start_idx = idx
                break
        
        # If the first detected "A ..." is likely part of the question stem,
        # move to the next A that still appears before B.
        if answer_a_idx >= 0 and answer_b_idx > answer_a_idx:
            a_line = lines[answer_a_idx].strip()
            b_line = lines[answer_b_idx].strip()
            stem_before_a = ' '.join(
                s.strip() for s in lines[max(q_start_idx, 0):answer_a_idx] if s.strip()
            )
            # True answers tend to be short list options. A long first "A ..."
            # with another A before B usually indicates a stem like "A project ..."
            if (
                not re.search(r'\?', a_line) and
                re.search(r'^(A|B|C|D)\s+', b_line) and
                (
                    len(a_line) > 90 or
                    (re.search(r'^Question\s+ID\s*:', lines[max(q_start_idx, 0)].strip(), re.IGNORECASE) and not re.search(r'\?', stem_before_a))
                )
            ):
                for idx in range(answer_a_idx + 1, answer_b_idx):
                    if re.match(r'^A\s+', lines[idx].strip()):
                        answer_a_idx = idx
                        break
        
        # Extract question text from q_start_idx to answer_a_idx
        q_text = []
        for idx in range(q_start_idx, answer_a_idx):
            s = lines[idx].strip()
            # Skip empty lines, dashes, and "of XXX" (from "Question X of XXX")
            # Also skip lines that match answer patterns (shouldn't happen, but just in case)
            if s and not s.startswith('---') and not re.match(r'^of\s+\d+', s, re.IGNORECASE):
                # Remove "Question ID: XXX" prefix if present
                s = re.sub(r'^Question\s+ID\s*:\s*\d+\s*', '', s, flags=re.IGNORECASE).strip()
                if s:
                    q_text.append(s)
        
        data['Question'] = ' '.join(q_text).strip()
        
        # ===== EXTRACT ANSWERS A, B, C, D =====
        # We already found the answer indices, just extract the text
        if answer_a_idx >= 0:
            data['Answer A'] = re.sub(r'^A\s+', '', lines[answer_a_idx].strip())
        if answer_b_idx >= 0:
            data['Answer B'] = re.sub(r'^B\s+', '', lines[answer_b_idx].strip())
        if answer_c_idx >= 0:
            data['Answer C'] = re.sub(r'^C\s+', '', lines[answer_c_idx].strip())
        if answer_d_idx >= 0:
            data['Answer D'] = re.sub(r'^D\s+', '', lines[answer_d_idx].strip())
    
    # ===== EXTRACT CORRECT ANSWER =====
    for line in lines:
        # Try both "Correct Answer: X" and "Answer: X" formats
        match = re.match(r'^Correct\s+Answer\s*:\s*([A-D])', line.strip(), re.IGNORECASE)
        if not match:
            match = re.match(r'^Answer\s*:\s*([A-D])(?!\w)', line.strip(), re.IGNORECASE)
        if match:
            data['Correct Answer'] = match.group(1).upper()
            break
    
    # ===== EXTRACT EXPLANATION =====
    # Find "Explanation:" line
    explanation_idx = -1
    
    for idx, line in enumerate(lines):
        line_stripped = line.strip()
        if re.match(r'^Explanation\s*:', line_stripped, re.IGNORECASE) and explanation_idx == -1:
            explanation_idx = idx
            break
    
    if explanation_idx >= 0:
        line = lines[explanation_idx].strip()
        # Extract text after "Explanation: "
        exp_text = re.sub(r'^Explanation\s*:\s*', '', line, flags=re.IGNORECASE)
        
        # Collect continuation lines until "Details for Each Option:" appears
        for i in range(explanation_idx + 1, len(lines)):
            next_line = lines[i].strip()
            
            # Stop if "Details for Each Option:" appears anywhere in the line
            if 'Details for Each Option' in next_line:
                break
            
            # Stop at Reference
            if re.match(r'^Reference\s*:', next_line, re.IGNORECASE):
                break
            
            # Stop at dashed separator
            if re.match(r'^--+', next_line):
                break
            
            if next_line:
                exp_text += ' ' + next_line
        
        # Final cleanup: remove "Details for Each Option" and everything after it
        if 'Details for Each Option' in exp_text:
            exp_text = exp_text[:exp_text.index('Details for Each Option')].strip()
        
        # Also remove any trailing text that looks like "Details for..." even with slight variations
        exp_text = re.sub(r'\s+Details\s+for\s+.*$', '', exp_text, flags=re.IGNORECASE)
        
        exp_text = re.sub(r'\s+', ' ', exp_text).strip()
        data['Explanation'] = exp_text[:2000]
    
    return data


def save_to_csv(questions, csv_file):
    """Save questions to CSV"""
    
    fieldnames = [
        'No', 'Question', 'Answer A', 'Answer B', 'Answer C', 'Answer D',
        'Correct Answer', 'Explanation'
    ]
    
    with open(csv_file, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(questions)
    
    size_kb = Path(csv_file).stat().st_size / 1024
    print(f"✅ Saved {len(questions)} questions to {csv_file}")
    print(f"   Size: {size_kb:.1f} KB")


if __name__ == "__main__":
    import sys
    
    # Mặc định: sử dụng tất cả file .md trong thư mục hiện tại
    if len(sys.argv) > 1:
        md_file = sys.argv[1]
        output_dir = sys.argv[2] if len(sys.argv) > 2 else "csv"
        try:
            success = main(md_file, output_dir)
            if not success:
                exit(1)
        except Exception as e:
            print(f"\n❌ Error: {e}")
            import traceback
            traceback.print_exc()
            exit(1)
    else:
        # Xử lý tất cả file .md trong thư mục hiện tại
        md_dir = Path(__file__).parent
        md_files = list(md_dir.glob("*.md"))
        
        if not md_files:
            print("❌ No markdown files found in current directory")
            exit(1)
        
        for md_file in md_files:
            print(f"\n{'=' * 70}")
            try:
                success = main(str(md_file), "csv")
                if not success:
                    print(f"⚠️  Failed to process {md_file.name}")
            except Exception as e:
                print(f"\n❌ Error processing {md_file.name}: {e}")
                import traceback
                traceback.print_exc()
