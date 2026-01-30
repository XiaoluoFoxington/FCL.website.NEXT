import json
import os
from pathlib import Path

def read_old_data(input_path):
    """读取并解析旧版数据文件"""
    try:
        with open(input_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        raise ValueError(f"错误：输入文件不存在 - {input_path}")
    except json.JSONDecodeError:
        raise ValueError(f"错误：文件格式无效，不是合法的JSON - {input_path}")
    except Exception as e:
        raise ValueError(f"读取文件失败：{str(e)}")

def create_output_dir(output_path):
    """创建输出目录（含父目录）"""
    try:
        Path(output_path).mkdir(parents=True, exist_ok=True)
        return True
    except PermissionError:
        raise PermissionError(f"权限不足，无法创建目录 - {output_path}")
    except Exception as e:
        raise ValueError(f"创建目录失败：{str(e)}")

def convert_data_structure(input_file, output_dir):
    """
    将旧版数据结构转换为新版数据结构（nextUrl方式）
    - 去掉所有description
    - 按层级创建文件夹和索引文件
    """
    # 读取源数据
    old_data = read_old_data(input_file)
    if 'children' not in old_data:
        raise ValueError("无效的旧版数据格式：缺少children字段")

    # 创建输出根目录
    create_output_dir(output_dir)

    # 处理根级数据
    root_items = []
    for old_item in old_data['children']:
        if old_item.get('type') == 'directory':
            root_items.append({
                'name': old_item['name'],
                'nextUrl': f"{old_item['name']}/index.json"
            })

    # 保存根索引文件
    root_index_path = os.path.join(output_dir, 'index.json')
    with open(root_index_path, 'w', encoding='utf-8') as f:
        json.dump(root_items, f, ensure_ascii=False, indent=2)

    # 处理子目录数据
    for old_item in old_data['children']:
        if old_item.get('type') == 'directory':
            version_name = old_item['name']
            version_dir = os.path.join(output_dir, version_name)
            create_output_dir(version_dir)

            # 处理版本内文件
            version_items = []
            for file_item in old_item.get('children', []):
                if file_item.get('type') == 'file':
                    version_items.append({
                        'name': f"{file_item['arch']} 架构",
                        'url': file_item['download_link'].strip()
                    })

            # 保存版本索引文件
            version_index_path = os.path.join(version_dir, 'index.json')
            with open(version_index_path, 'w', encoding='utf-8') as f:
                json.dump(version_items, f, ensure_ascii=False, indent=2)

    return {
        'output_dir': output_dir,
        'root_file': root_index_path,
        'type': 'nextUrl'
    }

def convert_data_structure_inline(input_file, output_dir):
    """
    将旧版数据结构转换为新版数据结构（内联children方式）
    - 去掉所有description
    - 所有数据合并到单个文件
    """
    # 读取源数据
    old_data = read_old_data(input_file)
    if 'children' not in old_data:
        raise ValueError("无效的旧版数据格式：缺少children字段")

    # 创建输出目录
    create_output_dir(output_dir)

    # 处理内联结构数据
    root_items = []
    for old_item in old_data['children']:
        if old_item.get('type') == 'directory':
            version_items = []
            for file_item in old_item.get('children', []):
                if file_item.get('type') == 'file':
                    version_items.append({
                        'name': f"{file_item['arch']} 架构",
                        'url': file_item['download_link'].strip()
                    })
            root_items.append({
                'name': old_item['name'],
                'children': version_items
            })

    # 保存根文件
    root_file_path = os.path.join(output_dir, 'root.json')
    with open(root_file_path, 'w', encoding='utf-8') as f:
        json.dump(root_items, f, ensure_ascii=False, indent=2)

    return {
        'output_dir': output_dir,
        'root_file': root_file_path,
        'type': 'inline'
    }

def get_valid_path(prompt, is_file=True):
    """获取有效的文件/目录路径"""
    while True:
        path = input(prompt).strip()
        if not path:
            print("路径不能为空，请重新输入")
            continue
            
        abs_path = os.path.abspath(path)
        if is_file and not os.path.isfile(abs_path):
            print(f"错误：文件不存在 - {abs_path}")
            continue
        if not is_file and os.path.isfile(abs_path):
            print(f"错误：已存在同名文件 - {abs_path}")
            continue
        return abs_path

def print_result(result):
    """打印转换结果"""
    print("\n" + "="*50)
    print("✅ 数据转换成功！")
    print(f"转换类型：{'多级目录结构' if result['type'] == 'nextUrl' else '单文件内联结构'}")
    print(f"输出目录：{result['output_dir']}")
    print(f"主索引文件：{result['root_file']}")
    print("="*50 + "\n")

def main():

    print("FCL下载站数据源mdui版转NEXT版.py")
    print("此程序用于将FCL下载站（https://foldcraftlauncher.cn）的mdui版数据源（XiaoluoFoxington/FCL.website.mdui）转换为NEXT版数据源（XiaoluoFoxington/FCL.website.NEXT）。")
    print("作者：洛狐XiaoluoFoxington&Qwen3-Coder&Doubao-Seed")

    while True:
        # 获取输入输出路径
        input_file = get_valid_path("请输入旧版数据文件路径：", is_file=True)
        output_dir = get_valid_path("请输入输出目录路径：", is_file=False)

        # 获取模式
        print("请选择转换模式：")
        print("1. 多级目录模式（使用nextUrl，生成多个索引文件）")
        print("2. 单文件模式（使用内联children，生成单个JSON文件）")
        print("3. 退出程序")

        # 获取用户选择
        choice = input("请输入选项 (1/2/3)：").strip()
        if choice not in ['1', '2', '3']:
            print("无效选项，请输入1、2或3\n")
            continue

        # 退出程序
        if choice == '3':
            print("感谢使用，再见！")
            break

        # 执行转换
        try:
            if choice == '1':
                result = convert_data_structure(input_file, output_dir)
            else:
                result = convert_data_structure_inline(input_file, output_dir)
            print_result(result)
        except Exception as e:
            print(f"\n❌ 转换失败：{str(e)}\n")

if __name__ == "__main__":
    main()
