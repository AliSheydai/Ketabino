var asm = System.Reflection.Assembly.LoadFrom(System.IO.Path.Combine(System.Environment.GetFolderPath(System.Environment.SpecialFolder.UserProfile), ".nuget/packages/microsoft.openapi/2.7.5/lib/netstandard2.0/Microsoft.OpenApi.dll"));
foreach (var type in asm.GetTypes())
{
    if (type.Name.Contains("SecurityScheme"))
        Console.WriteLine(type.FullName);
}
