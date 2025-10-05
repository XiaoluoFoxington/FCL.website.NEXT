import json
import os
from pathlib import Path

def should_remove_first_element(data):
    """检查是否应该移除第一个元素"""
    if not isinstance(data, list) or len(data) == 0:
        return False
    
    first_item = data[0]
    if not isinstance(first_item, dict) or 'name' not in first_item:
        return False
    
    name = first_item['name']
    return name.startswith('点击选择 ')

def process_json_file(file_path, backup_dir):
    """处理单个JSON文件"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if should_remove_first_element(data):
            print(f"发现需要处理的文件: {file_path}")
            print(f"第一个元素的name: {data[0]['name']}")
            
            user_input = input("是否移除第一个元素? (y/n): ").strip().lower()
            if user_input in ['y', 'yes', '是']:
                modified_data = data[1:]  # 移除第一个元素
                
                # 创建备份目录（如果不存在）
                backup_dir.mkdir(parents=True, exist_ok=True)
                
                # 创建备份文件路径 - 使用更简单的命名方式
                backup_filename = file_path.name + '.bak'
                backup_path = backup_dir / backup_filename
                
                # 确保备份文件名唯一
                counter = 1
                original_backup_path = backup_path
                while backup_path.exists():
                    backup_path = original_backup_path.with_name(f"{original_backup_path.stem}_{counter}{original_backup_path.suffix}")
                    counter += 1
                
                # 备份原文件
                with open(file_path, 'r', encoding='utf-8') as original:
                    with open(backup_path, 'w', encoding='utf-8') as backup:
                        backup.write(original.read())
                
                # 写入修改后的内容
                with open(file_path, 'w', encoding='utf-8', newline='') as f:
                    json.dump(modified_data, f, ensure_ascii=False, indent=2)
                
                print(f"已处理并保存: {file_path}")
                print(f"备份文件: {backup_path}")
            else:
                print(f"跳过文件: {file_path}")
        else:
            print(f"文件不符合处理条件，跳过: {file_path}")
    
    except json.JSONDecodeError:
        print(f"JSON格式错误，跳过文件: {file_path}")
    except Exception as e:
        print(f"处理文件时出错 {file_path}: {str(e)}")

def main():
    # 创建备份目录
    backup_dir = Path('./json_backups')
    
    # 获取当前目录下所有JSON文件
    current_dir = Path('.')
    
    json_files = list(current_dir.rglob('*.json'))
    
    if not json_files:
        print("在当前目录及其子目录中未找到任何JSON文件")
        return
    
    print(f"找到 {len(json_files)} 个JSON文件")
    
    for json_file in json_files:
        print(f"\n正在检查: {json_file}")
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            if should_remove_first_element(data):
                print(f"发现需要处理的文件: {json_file}")
                print(f"第一个元素的name: {data[0]['name']}")
                
                user_input = input("是否移除第一个元素? (y/n): ").strip().lower()
                if user_input in ['y', 'yes', '是']:
                    modified_data = data[1:]  # 移除第一个元素
                    
                    # 创建备份目录（如果不存在）
                    backup_dir.mkdir(parents=True, exist_ok=True)
                    
                    # 创建备份文件路径 - 使用更简单的命名方式
                    backup_filename = json_file.name + '.bak'
                    backup_path = backup_dir / backup_filename
                    
                    # 确保备份文件名唯一
                    counter = 1
                    original_backup_path = backup_path
                    while backup_path.exists():
                        backup_path = original_backup_path.with_name(f"{original_backup_path.stem}_{counter}{original_backup_path.suffix}")
                        counter += 1
                    
                    # 备份原文件
                    with open(json_file, 'r', encoding='utf-8') as original:
                        with open(backup_path, 'w', encoding='utf-8') as backup:
                            backup.write(original.read())
                    
                    # 写入修改后的内容
                    with open(json_file, 'w', encoding='utf-8', newline='') as f:
                        json.dump(modified_data, f, ensure_ascii=False, indent=2)
                    
                    print(f"已处理并保存: {json_file}")
                    print(f"备份文件: {backup_path}")
                else:
                    print(f"跳过文件: {json_file}")
            else:
                print(f"文件不符合处理条件，跳过: {json_file}")
        
        except json.JSONDecodeError:
            print(f"JSON格式错误，跳过文件: {json_file}")
        except Exception as e:
            print(f"处理文件时出错 {json_file}: {str(e)}")

if __name__ == "__main__":
    main()