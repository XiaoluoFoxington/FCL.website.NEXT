import json
import os

def generate_architecture_json():
    """
    交互式收集版本名、输出路径和各架构URL，生成指定格式的JSON文件
    """
    # 定义固定的架构列表（无需用户输入）
    architectures = [
        "all",
        "arm64-v8a",
        "armeabi-v7a",
        "x86",
        "x86_64"
    ]
    
    # 1. 询问版本名（带非空校验）
    print("===== 生成架构URL JSON文件工具 =====")
    while True:
        version_name = input("请输入版本名（例如：1.1.4.5）：").strip()
        if version_name:
            break
        print("错误：版本名不能为空，请重新输入！")
    
    # 2. 询问输出路径（新增核心逻辑）
    print("\n请指定JSON文件的输出路径：")
    while True:
        output_dir = input("输出路径（留空则保存到当前目录）：").strip()
        # 空路径则使用当前目录
        if not output_dir:
            output_dir = os.getcwd()
            print(f"📌 未指定输出路径，将保存到当前目录：{output_dir}")
            break
        # 检查路径是否存在
        if os.path.isdir(output_dir):
            break
        # 路径不存在，询问是否自动创建
        create_dir = input(f"路径 {output_dir} 不存在，是否自动创建？(y/n)：").strip().lower()
        if create_dir in ["y", "yes"]:
            try:
                os.makedirs(output_dir, exist_ok=True)
                print(f"✅ 已自动创建目录：{output_dir}")
                break
            except Exception as e:
                print(f"❌ 创建目录失败：{str(e)}，请重新输入路径！")
        else:
            print("⚠️  请重新输入有效的输出路径！")
    
    # 3. 逐个询问各架构对应的URL（带非空校验）
    json_data = []
    print("\n请依次输入以下架构对应的下载URL：")
    for arch in architectures:
        while True:
            url = input(f"{arch} 架构的下载URL：").strip()
            if url:
                break
            print(f"错误：{arch} 架构的URL不能为空，请重新输入！")
        # 构建单个架构的字典
        json_data.append({
            "name": f"{arch} 架构",
            "url": url
        })
    
    # 4. 拼接完整的输出文件路径
    filename = f"{version_name}.json"
    full_output_path = os.path.join(output_dir, filename)
    
    # 5. 生成JSON文件
    try:
        with open(full_output_path, "w", encoding="utf-8") as f:
            # ensure_ascii=False 保证中文正常显示，indent=2 格式化输出
            json.dump(json_data, f, ensure_ascii=False, indent=2)
        print(f"\n✅ 成功生成JSON文件：{full_output_path}")
        # 可选：打印生成的内容预览
        print("\n生成的JSON内容预览：")
        print(json.dumps(json_data, ensure_ascii=False, indent=2))
    except PermissionError:
        print(f"\n❌ 生成文件失败：无权限写入路径 {output_dir}！")
    except Exception as e:
        print(f"\n❌ 生成文件失败：{str(e)}")

if __name__ == "__main__":
    generate_architecture_json()
    print("\n🔚 操作完成！")
