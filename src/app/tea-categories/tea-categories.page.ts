import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { AuthenticationService } from '../services/authentication/authentication.service';
import { TeaCategory } from '../models/tea-category';
import { TeaCategoriesService } from '../services/tea-categories/tea-categories.service';

@Component({
  selector: 'app-tea-categories',
  templateUrl: 'tea-categories.page.html',
  styleUrls: ['tea-categories.page.scss']
})
export class TeaCategoriesPage implements OnDestroy, OnInit {
  private subscription: Subscription;
  categories: Array<TeaCategory>;

  constructor(
    private authentication: AuthenticationService,
    private navController: NavController,
    private teaCategories: TeaCategoriesService
  ) {}

  ngOnInit() {
    this.subscription = this.teaCategories.changed.subscribe(() => this.getData());
  }

  ionViewDidEnter() {
    this.getData();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  logout() {
    this.authentication.logout().subscribe(() => this.navController.navigateRoot('/login'));
  }

  editCategory(id: number) {
    this.navController.navigateForward(['edit-tea-category', id]);
  }

  private getData() {
    this.teaCategories.getAll().subscribe(x => (this.categories = x));
  }
}
