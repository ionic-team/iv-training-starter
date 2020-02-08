import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'tea-categories', pathMatch: 'full' },
  { path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule) },
  {
    path: 'edit-tea-category',
    loadChildren: () => import('./edit-tea-category/edit-tea-category.module').then(m => m.EditTeaCategoryPageModule)
  },
  {
    path: 'tea-categories',
    loadChildren: () => import('./tea-categories/tea-categories.module').then(m => m.TeaCategoriesPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
