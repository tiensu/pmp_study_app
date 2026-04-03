#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PDF to Markdown Converter
Extracts text từ file PDF và lưu vào file .md với format được bảo toàn
"""

import pdfplumber
import os
from pathlib import Path


def _normalize_filename(filename):
    """
    Normalize filename: thay dấu cách bằng dấu gạch dưới
    
    Args:
        filename (str): Tên file cần normalize
    
    Returns:
        str: Tên file đã được normalize
    """
    return filename.replace(' ', '_')


def extract_pdf_to_markdown(pdf_directory, output_directory=None):
    """
    Extract text từ tất cả file PDF trong một thư mục và lưu vào markdown files
    
    Args:
        pdf_directory (str): Đường dẫn tới thư mục chứa file PDF
        output_directory (str, optional): Đường dẫn tới thư mục lưu markdown output.
                                        Nếu None, sẽ tạo file .md cùng thư mục với PDF
    
    Returns:
        int: Số file PDF được xử lý thành công
    """
    
    pdf_dir = Path(pdf_directory)
    
    # Kiểm tra thư mục có tồn tại không
    if not pdf_dir.exists():
        print(f"❌ Lỗi: Thư mục '{pdf_directory}' không tồn tại!")
        return 0
    
    # Tìm tất cả file PDF
    pdf_files = list(pdf_dir.glob('*.pdf'))
    
    if not pdf_files:
        print(f"⚠️  Không tìm thấy file PDF nào trong thư mục '{pdf_directory}'")
        return 0
    
    print(f"🔍 Tìm thấy {len(pdf_files)} file PDF\n")
    
    success_count = 0
    
    for pdf_file in pdf_files:
        try:
            # Xác định đường dẫn output với filename normalized
            normalized_stem = _normalize_filename(pdf_file.stem)
            if output_directory:
                output_dir = Path(output_directory)
                output_dir.mkdir(parents=True, exist_ok=True)
                output_path = output_dir / f"{normalized_stem}.md"
            else:
                output_path = pdf_file.parent / f"{normalized_stem}.md"
            
            print(f"📖 Đang xử lý: {pdf_file.name}")
            print(f"💾 Output: {output_path}")
            
            markdown_content = []
            page_count = 0
            
            # Mở và đọc PDF file
            with pdfplumber.open(str(pdf_file)) as pdf:
                total_pages = len(pdf.pages)
                
                for page_num, page in enumerate(pdf.pages, 1):
                    # Extract text với layout information
                    text = page.extract_text()
                    
                    if text:
                        page_count += 1
                        # Không thêm page break (bỏ --- giữa các trang)
                        # if page_num > 1:
                        #     markdown_content.append("\n---\n")
                        
                        # Xử lý text để giữ format
                        markdown_content.append(_process_text(text))
                        print(f"  ✓ Trang {page_num}/{total_pages}")
            
            # Ghi vào file markdown
            with open(str(output_path), 'w', encoding='utf-8') as f:
                f.write('\n'.join(markdown_content))
            
            # Post-process: Thêm separator trước mỗi Question
            _add_question_separators(output_path)
            
            print(f"✅ Thành công! Đã extract {page_count} trang từ PDF")
            print(f"📄 File markdown được lưu tại: {output_path}\n")
            success_count += 1
            
        except Exception as e:
            print(f"❌ Lỗi khi xử lý {pdf_file.name}: {str(e)}\n")
    
    return success_count


def _is_heading_or_option(stripped):
    """
    Kiểm tra xem dòng có phải là heading hoặc option không
    
    Args:
        stripped (str): Dòng text đã được strip
    
    Returns:
        bool: True nếu là heading hoặc option
    """
    import re
    
    # Kiểm tra heading
    if stripped.upper() in ['QUESTION', 'ANSWER:', 'HINT:', 'EXPLANATION:', 'REFERENCE:']:
        return True
    if stripped.lower().startswith('details for each option'):
        return True
    
    # Kiểm tra pattern "Question X", "Explanation X", "PMP Exam X", v.v.
    # Ví dụ: "Question 1", "Question 2", "PMP Exam 1", "Explanation 1", etc.
    if re.match(r'^(Question|Exam|Explanation|Answer|Hint|Reference)\s+\d+', stripped, re.IGNORECASE):
        return True
    
    # Kiểm tra option (A, B, C, D)
    if len(stripped) > 1 and stripped[0] in ['A', 'B', 'C', 'D'] and stripped[1] in [' ', '\t']:
        return True
    
    return False


def _should_merge_with_previous(stripped):
    """
    Kiểm tra xem dòng này có nên được hợp nhất với dòng trước không
    
    Args:
        stripped (str): Dòng text đã được strip
    
    Returns:
        bool: True nếu nên hợp nhất
    """
    # Bỏ qua dòng trống
    if not stripped:
        return False
    
    # Bỏ qua heading và option
    if _is_heading_or_option(stripped):
        return False
    
    # Bỏ qua dòng bắt đầu bằng số (có thể là list item với số)
    if stripped[0].isdigit():
        return False
    
    # Nếu không phải các trường hợp trên, có thể là part of paragraph
    return True


def _process_text(text):
    """
    Xử lý text để cải thiện format markdown
    - Hợp nhất các dòng liên tiếp thành đoạn văn hoàn chỉnh
    - Bỏ tất cả dòng --- từ PDF
    
    Args:
        text (str): Text được extract từ PDF
    
    Returns:
        str: Text đã được format cho markdown
    """
    import re
    
    lines = text.split('\n')
    processed_lines = []
    current_paragraph = []
    
    for line in lines:
        stripped = line.strip()
        
        # Xử lý dòng trống
        if not stripped:
            # Kết thúc paragraph hiện tại nếu có
            if current_paragraph:
                processed_lines.append(' '.join(current_paragraph))
                current_paragraph = []
            # Thêm dòng trống
            if not processed_lines or processed_lines[-1] != '':
                processed_lines.append('')
            continue
        
        # BỎ dòng "---" hoàn toàn
        if stripped == '---':
            if current_paragraph:
                processed_lines.append(' '.join(current_paragraph))
                current_paragraph = []
            continue
        
        # Kiểm tra nếu là heading hay special line
        is_special = False
        
        # Heading keywords
        if stripped.upper() in ['QUESTION', 'ANSWER:', 'HINT:', 'EXPLANATION:', 'REFERENCE:', 'CORRECT ANSWER:', 'CORRECT ANSWER']:
            is_special = True
        elif stripped.lower().startswith('details for each option'):
            is_special = True
        # Question pattern
        elif re.match(r'^Question\s+\d+', stripped, re.IGNORECASE):
            is_special = True
        # Option list (A: ..., B: ..., etc.)
        elif len(stripped) > 2 and stripped[0] in ['A', 'B', 'C', 'D'] and stripped[1] in [':', ' ']:
            is_special = True
        
        # Xử lý special lines
        if is_special:
            # Kết thúc paragraph hiện tại
            if current_paragraph:
                processed_lines.append(' '.join(current_paragraph))
                current_paragraph = []
            
            # Format special line
            if stripped.upper() in ['QUESTION', 'ANSWER:', 'HINT:', 'EXPLANATION:', 'REFERENCE:', 'CORRECT ANSWER:', 'CORRECT ANSWER'] \
               or stripped.lower().startswith('details for each option'):
                # Thêm dòng trống trước nếu cần
                if processed_lines and processed_lines[-1] != '':
                    processed_lines.append('')
                processed_lines.append(f"**{stripped}**")
            elif len(stripped) > 2 and stripped[0] in ['A', 'B', 'C', 'D'] and stripped[1] in [':', ' ']:
                # Option list item
                processed_lines.append(f"- **{stripped}**")
            else:
                # Question hay special pattern khác
                processed_lines.append(stripped)
        else:
            # Dòng bình thường - thêm vào paragraph để merge
            current_paragraph.append(stripped)
    
    # Xử lý paragraph còn lại
    if current_paragraph:
        processed_lines.append(' '.join(current_paragraph))
    
    # Loại bỏ dòng trống lặp lại cuối cùng
    while processed_lines and processed_lines[-1] == '':
        processed_lines.pop()
    
    return '\n'.join(processed_lines)


def _add_question_separators(md_file_path):
    """
    Post-process .md file:
    1. Loại bỏ các ký tự ** và - ** 
    2. Thêm dấu ----------- trước mỗi "Question X" (trừ Question đầu tiên)
    3. Merge toàn bộ text liên tiếp thành 1 dòng (giữa các keyword và question)
    
    Args:
        md_file_path (Path): Đường dẫn file .md
    """
    import re
    
    with open(md_file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    result_lines = []
    question_found = False
    i = 0
    
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        
        # Loại bỏ ** và - ** từ dòng
        if stripped.startswith('**') and stripped.endswith('**'):
            # Là heading, loại bỏ ** khỏi cả hai đầu
            cleaned = stripped[2:-2].strip()
            stripped = cleaned
        elif stripped.startswith('- **') and stripped.endswith('**'):
            # Là option list item, loại bỏ - ** và **
            cleaned = stripped[4:-2].strip()
            stripped = cleaned
        
        # Kiểm tra nếu dòng này là dòng heading (keyword hoặc Question X)
        is_heading = (re.match(r'^Question\s+\d+', stripped, re.IGNORECASE) is not None) or \
                     stripped.upper() in ['QUESTION', 'ANSWER', 'HINT', 'EXPLANATION', 'REFERENCE', 'CORRECT ANSWER', 'DETAILS FOR EACH OPTION'] or \
                     stripped.isupper() or \
                     any(ch.isupper() for ch in stripped.split()[0:2] if ch)  # Kiểm tra heading-like
        
        if is_heading and stripped:
            # Nếu là Question X, thêm separator trước (nếu không phải Question đầu tiên)
            if re.match(r'^Question\s+\d+', stripped, re.IGNORECASE):
                if question_found:
                    # Xóa dòng trống cuối nếu có
                    if result_lines and result_lines[-1].strip() == '':
                        result_lines.pop()
                    result_lines.append('\n')
                    result_lines.append('-' * 18 + '\n')
                    result_lines.append('\n')
                else:
                    question_found = True
            
            result_lines.append(stripped + '\n')
            i += 1
        
        elif stripped == '':
            # Dòng trống
            result_lines.append('\n')
            i += 1
        
        else:
            # Đây là dòng text thường - merge với các dòng tiếp theo cho đến khi gặp heading hoặc dòng trống
            paragraph_lines = []
            
            while i < len(lines):
                curr_line = lines[i]
                curr_stripped = curr_line.strip()
                
                # Loại bỏ ** và - ** từ dòng hiện tại
                if curr_stripped.startswith('**') and curr_stripped.endswith('**'):
                    curr_stripped = curr_stripped[2:-2].strip()
                elif curr_stripped.startswith('- **') and curr_stripped.endswith('**'):
                    curr_stripped = curr_stripped[4:-2].strip()
                
                # Nếu là dòng trống, dừng merge
                if curr_stripped == '':
                    break
                
                # Nếu là heading hoặc Question, dừng merge
                if (re.match(r'^Question\s+\d+', curr_stripped, re.IGNORECASE) is not None) or \
                   curr_stripped.upper() in ['QUESTION', 'ANSWER', 'HINT', 'EXPLANATION', 'REFERENCE', 'CORRECT ANSWER', 'DETAILS FOR EACH OPTION']:
                    break
                
                # Kiểm tra nếu là option list (bắt đầu bằng A:, B:, C:, D:)
                if len(curr_stripped) > 2 and curr_stripped[0] in ['A', 'B', 'C', 'D'] and curr_stripped[1] in [':', ' ']:
                    break
                
                paragraph_lines.append(curr_stripped)
                i += 1
            
            # Merge toàn bộ paragraph_lines thành 1 dòng
            if paragraph_lines:
                merged = ' '.join(paragraph_lines)
                result_lines.append(merged + '\n')
    
    # Ghi lại file
    with open(md_file_path, 'w', encoding='utf-8') as f:
        f.writelines(result_lines)


def extract_all_pdfs_in_directory(directory, output_directory=None):
    """
    (Deprecated) Sử dụng extract_pdf_to_markdown thay vì hàm này
    
    Extract tất cả PDF files trong một thư mục
    
    Args:
        directory (str): Đường dẫn thư mục chứa PDF files
        output_directory (str, optional): Thư mục lưu file markdown
    """
    return extract_pdf_to_markdown(directory, output_directory)


# Main script
if __name__ == "__main__":
    import sys
    
    # Lấy đường dẫn từ arguments hoặc sử dụng default
    if len(sys.argv) > 1:
        pdf_directory = sys.argv[1]
        output_directory = sys.argv[2] if len(sys.argv) > 2 else None
        extract_pdf_to_markdown(pdf_directory, output_directory)
    else:
        # Default: Extract từ tất cả PDF files trong thư mục hiện tại
        current_dir = Path(__file__).parent
        extract_pdf_to_markdown(str(current_dir))
